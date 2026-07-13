using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Extensions;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.ExternalIntegrations.Stripe;
using FlowPilot.Application.ExternalIntegrations.Stripe.Models;
using FlowPilot.Application.ExternalIntegrations.Stripe.Models.Request;
using FlowPilot.Application.ExternalIntegrations.Stripe.Models.Response;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.MultiTenant;
using FlowPilot.Application.Nexus.MultiTenant.Models;
using FlowPilot.Application.Nexus.Subscription;
using FlowPilot.Application.Nexus.Subscription.Models;
using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;
using FlowPilot.Infrastructure.ExternalIntegrations.Stripe.DbModels;
using FlowPilot.Infrastructure.Nexus.Subscription.DbModels;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using RestSharp;
using Stripe;

namespace FlowPilot.Infrastructure.ExternalIntegrations.Stripe;
public partial class StripeService : IStripeService
{
    private const string StripeMetadataTenantUniqueIdKey = "tenantUniqueId";
    private const string InternalSubscriptionIdKey = "internalSubscriptionId";
    private const string LoggedInUserIdKey = "loggedInUserIdKey";
    private const string TransKeyId = "transKeyId";

    private readonly ICurrentUser _currentUser;
    private readonly NexusDbContext _nexusDbContext;
    private readonly IUserService _userService;
    private readonly ITenantService _tenantService;
    private readonly ISubscriptionService _subscriptionService;

    public StripeService(ICurrentUser currentUser, NexusDbContext nexusDbContext, IUserService userService, ITenantService tenantService, ISubscriptionService subscriptionService)
    {
        _currentUser = currentUser;
        _nexusDbContext = nexusDbContext;
        _userService = userService;
        _tenantService = tenantService;
        _subscriptionService = subscriptionService;
    }

    public async Task<CreateIntentResponse> CreateIntent(CreateIntentRequest request)
    {
        var subscriptionDetails = await _nexusDbContext.Subscriptions.SingleOrDefaultAsync(x => x.Id == request.SubscriptionId);
        _ = subscriptionDetails ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "subscriptionDetails"));

        string message = string.Empty;
        string clientSecret = string.Empty;
        bool isOneTimePayment = subscriptionDetails.ValidityDuration == 1;
        var tenantDetails = await _tenantService.GetByIdAsync(_currentUser.GetTenant(), new CancellationToken());
        string email = tenantDetails.AdminEmail;

        string transKeyId = Guid.NewGuid().ToString();

        // Get or create customer
        var customer = await GetOrCreateCustomerAsync(tenantDetails);

        var intentResponse = new CreateIntentResponse
        {
            ClientSecret = string.Empty,
            IsSuccess = true,
            Message = string.Empty,
            TransKey = transKeyId
        };

        // one time payment
        if (isOneTimePayment)
        {
            var paymentIntentService = new PaymentIntentService();

            var paymentIntent = await paymentIntentService.CreateAsync(
                new PaymentIntentCreateOptions
                {
                    SetupFutureUsage = "off_session",
                    Amount = ConvertAmountToSmallestCurrency(request.Currency, subscriptionDetails.Price),
                    Currency = request.Currency.GetDescription(),
                    Description = subscriptionDetails.Name,
                    Customer = customer.Id,
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true
                    },
                    Metadata = new Dictionary<string, string>
                    {
                        [StripeMetadataTenantUniqueIdKey] = tenantDetails.UniqueId.ToString(),
                        [InternalSubscriptionIdKey] = subscriptionDetails.Id.ToString(),
                        [LoggedInUserIdKey] = _currentUser.GetUserId().ToString(),
                        [TransKeyId] = transKeyId
                    }
                });

            intentResponse.ClientSecret = paymentIntent.ClientSecret;
            intentResponse.Message = "<<user that it's ready>>";
            string stripePayload = JsonConvert.SerializeObject(paymentIntent);
            await PaymentInitializationStart(new StripePaymentInitializationDto
            {
                StripePayload = stripePayload,
                TransKeyId = transKeyId,
                IsOneTimePayment = true
            });
        }
        else
        {
            string stripePriceId = await CreatePriceIdAsync(subscriptionDetails, request.Currency);

            var subscriptionService = new SubscriptionService();
            var invoiceService = new InvoiceService();
            var options = new SubscriptionCreateOptions
            {
                Customer = customer.Id,
                Items = new List<SubscriptionItemOptions> { new SubscriptionItemOptions { Price = stripePriceId } },
                PaymentBehavior = "default_incomplete",
                PaymentSettings = new SubscriptionPaymentSettingsOptions
                {
                    SaveDefaultPaymentMethod = "on_subscription"
                },
                Metadata = new Dictionary<string, string>
                {
                    [StripeMetadataTenantUniqueIdKey] = tenantDetails.UniqueId.ToString(),
                    [InternalSubscriptionIdKey] = subscriptionDetails.Id.ToString(),
                    [LoggedInUserIdKey] = _currentUser.GetUserId().ToString(),
                    [TransKeyId] = transKeyId
                }
            };
            var subscription = await subscriptionService.CreateAsync(options);
            string stripePayload = JsonConvert.SerializeObject(subscription);

            var invoice = await invoiceService.GetAsync(subscription.LatestInvoiceId, new InvoiceGetOptions
            {
                Expand = ["payments.data.payment.payment_intent"]
            });

            intentResponse.ClientSecret = invoice.Payments.Data[0].Payment.PaymentIntent.ClientSecret;

            await PaymentInitializationStart(new StripePaymentInitializationDto
            {
                StripePayload = stripePayload,
                TransKeyId = transKeyId,
                IsOneTimePayment = false
            });
        }

        return intentResponse;
    }

    private async Task<Customer> GetOrCreateCustomerAsync(TenantsDto tenantsDto)
    {
        var customerService = new CustomerService();

        var listOptions = new CustomerListOptions
        {
            Limit = 100,
            Email = tenantsDto.AdminEmail,
        };

        var customers = await customerService.ListAsync(listOptions);
        var curtomer = customers.Data
            .FirstOrDefault(c => c.Metadata != null &&
                                c.Metadata.ContainsKey(StripeMetadataTenantUniqueIdKey) &&
                                c.Metadata[StripeMetadataTenantUniqueIdKey] == tenantsDto.UniqueId.ToString());

        if (curtomer != null)
        {
            await _tenantService.SaveTenantStripeCustomerIdAsync(tenantsDto.UniqueId, curtomer.Id);
        }
        else
        {
            // create
            var createOptions = new CustomerCreateOptions
            {
                Email = tenantsDto.AdminEmail,
                Metadata = new Dictionary<string, string>
                {
                    [StripeMetadataTenantUniqueIdKey] = tenantsDto.UniqueId.ToString()
                },

            };

            curtomer = await customerService.CreateAsync(createOptions);
            await _tenantService.SaveTenantStripeCustomerIdAsync(tenantsDto.UniqueId, curtomer.Id);
        }

        return curtomer;
    }

    private async Task<string> CreatePriceIdAsync(Subscriptions subscriptionDetails, StripeCurrencyType currency)
    {
        var priceService = new PriceService();

        var priceOptions = new PriceCreateOptions
        {
            // UnitAmountDecimal = (decimal)(subscriptionDetails.Price * 100),
            UnitAmountDecimal = ConvertAmountToSmallestCurrency(currency, subscriptionDetails.Price),
            Currency = currency.GetDescription(),
            Recurring = new PriceRecurringOptions
            {
                Interval = GetSubscriptionPlanPaymentCycleType(subscriptionDetails.ValidityDurationType)
            },
            ProductData = new PriceProductDataOptions
            {
                Name = subscriptionDetails.Name
            },
        };

        var price = await priceService.CreateAsync(priceOptions);
        return price.Id;
    }

    public async Task HandleStripeEventAsync(string jsonPayload)
    {
        var stripeEvent = EventUtility.ParseEvent(jsonPayload);
        string? tenantUidStr = string.Empty;
        string? internalSubIdStr = string.Empty;
        string stripeSubscriptionId = string.Empty;
        string? priceId = string.Empty;
        string? transKeyId = string.Empty;
        string? stripeInvoiceId = string.Empty;

        switch (stripeEvent.Type)
        {
            case "invoice.payment_succeeded":
                if (stripeEvent.Data.Object is not Invoice invoice) break;

                if (invoice.Parent.SubscriptionDetails.Metadata != null)
                {
                    tenantUidStr = invoice.Parent.SubscriptionDetails.Metadata.GetValueOrDefault("tenantUniqueId");
                    internalSubIdStr = invoice.Parent.SubscriptionDetails.Metadata.GetValueOrDefault("internalSubscriptionId");
                    stripeSubscriptionId = invoice.Parent.SubscriptionDetails.SubscriptionId;
                    // Aman - change made price.Id
                    priceId = invoice.Lines.Data.FirstOrDefault().Pricing.PriceDetails.Price.Id;
                    transKeyId = invoice.Parent.SubscriptionDetails.Metadata.GetValueOrDefault("transKeyId");
                    if (!string.IsNullOrEmpty(tenantUidStr) && !string.IsNullOrEmpty(transKeyId) && !string.IsNullOrEmpty(internalSubIdStr) && Guid.TryParse(tenantUidStr, out Guid tenantUid) && int.TryParse(internalSubIdStr, out int subPlanId))
                    {
                        if (await _subscriptionService.IsInitialPayment(stripeSubscriptionId))
                        {
                            string stripeSchedulerId = await CreateSubscriptionScheduleIfNotExists(stripeSubscriptionId, invoice, tenantUid, subPlanId);

                            await _subscriptionService.AssignSubscriptionPlan(new AssignSubscriptionPlanDto
                            {
                                IsDefaultViaRegistration = false,
                                TenantUniqueId = tenantUid,
                                SubscriptionPlanId = subPlanId,
                                StripeSubscriptionId = stripeSubscriptionId,
                                StripeSubscriptionSchedulerId = stripeSchedulerId,
                                StripeJsonPayload = jsonPayload,
                                StripePriceId = priceId
                            });
                        }
                        else
                        {
                            await _subscriptionService.UpdateTenantSubscriptionPlanInvoice(jsonPayload, "Paid");
                        }

                        // update payment status
                        await PaymentInitializationStatusUpdate(new StripePaymentInitializationStatusUpdateDto
                        {
                            PaymentStatus = StripePaymentStatus.Paid,
                            StripePaymentSuccessPayload = jsonPayload,
                            StripeInvoiceId = invoice.Id,
                            TransKeyId = transKeyId,
                            StripeSubscriptionId = stripeSubscriptionId
                        });
                    }

                }

                break;

            case "invoice.payment_failed":
                // email user that payment is failed :(

                if (stripeEvent.Data.Object is not Invoice failedInvoice) break;
                if (failedInvoice.Parent.SubscriptionDetails.Metadata != null)
                {
                    tenantUidStr = failedInvoice.Parent.SubscriptionDetails.Metadata.GetValueOrDefault("tenantUniqueId");
                    internalSubIdStr = failedInvoice.Parent.SubscriptionDetails.Metadata.GetValueOrDefault("internalSubscriptionId");
                    stripeSubscriptionId = failedInvoice.Parent.SubscriptionDetails.SubscriptionId;
                    priceId = failedInvoice.Lines.Data.FirstOrDefault().Pricing.PriceDetails.Price.Id;
                    transKeyId = failedInvoice.Parent.SubscriptionDetails.Metadata.GetValueOrDefault("transKeyId");
                    stripeInvoiceId = failedInvoice.Id;

                    if (await _nexusDbContext.TenantSubscriptionPlans.AnyAsync(x => x.StripeSubscriptionId == stripeSubscriptionId))
                    {
                        if (!string.IsNullOrEmpty(tenantUidStr) && !string.IsNullOrEmpty(transKeyId) && !string.IsNullOrEmpty(internalSubIdStr) && Guid.TryParse(tenantUidStr, out Guid tenantUid) && int.TryParse(internalSubIdStr, out int subPlanId))
                        {
                            await _subscriptionService.UpdateTenantSubscriptionPlanInvoice(jsonPayload, "Failed");

                            // update payment status
                            await PaymentInitializationStatusUpdate(new StripePaymentInitializationStatusUpdateDto
                            {
                                PaymentStatus = StripePaymentStatus.Failed,
                                StripePaymentErrorPayload = jsonPayload,
                                StripeInvoiceId = stripeInvoiceId,
                                TransKeyId = transKeyId!,
                                StripeSubscriptionId = stripeSubscriptionId
                            });
                        }
                    }
                    else
                    {
                        // update payment status
                        await PaymentInitializationStatusUpdate(new StripePaymentInitializationStatusUpdateDto
                        {
                            PaymentStatus = StripePaymentStatus.Failed,
                            StripePaymentErrorPayload = jsonPayload,
                            StripeInvoiceId = stripeInvoiceId,
                            TransKeyId = transKeyId!,
                            StripeSubscriptionId = stripeSubscriptionId
                        });
                    }
                }

                break;

            default:

                break;
        }
    }

    private async Task<string> CreateSubscriptionScheduleIfNotExists(string stripeSubscriptionId, Invoice invoice, Guid tenantUniqueId, int internalSubscriptionId)
    {
        // Get active internal subscription
        if (string.IsNullOrEmpty(stripeSubscriptionId) || invoice == null)
            return string.Empty;

        var subscription = await _nexusDbContext.Subscriptions.SingleOrDefaultAsync(x => x.Id == internalSubscriptionId);

        if (subscription == null) return string.Empty;

        if (subscription.ValidityDuration <= 1) return string.Empty;

        string? priceId = invoice.Lines?.Data?.FirstOrDefault()?.Pricing?.PriceDetails?.Price.Id;

        if (string.IsNullOrEmpty(priceId)) return string.Empty;

        // Create schedule
        var scheduleService = new SubscriptionScheduleService();
        var result = await scheduleService.CreateAsync(new SubscriptionScheduleCreateOptions { FromSubscription = stripeSubscriptionId, });

        if (result != null)
        {
            var currentPhase = result.Phases[0];
            await scheduleService.UpdateAsync(
                result.Id,
                new SubscriptionScheduleUpdateOptions
                {
                    EndBehavior = "cancel",
                    Phases = new List<SubscriptionSchedulePhaseOptions>
                         {
                                new SubscriptionSchedulePhaseOptions
                                {
                                    Items = currentPhase.Items
                                        .Select(i => new SubscriptionSchedulePhaseItemOptions
                                        {
                                            Price = i.PriceId,
                                            Quantity = i.Quantity
                                        })
                                        .ToList(),

                                    StartDate = currentPhase.StartDate,
                                    EndDate = currentPhase.EndDate
                                },

                                new SubscriptionSchedulePhaseOptions
                                {
                                    Items = new List<SubscriptionSchedulePhaseItemOptions>
                                    {
                                        new SubscriptionSchedulePhaseItemOptions
                                        {
                                            Price = priceId,
                                            Quantity = 1
                                        }
                                    },
                                    Duration = new SubscriptionSchedulePhaseDurationOptions
                                    {
                                        Interval = GetSubscriptionPlanPaymentCycleType(subscription.ValidityDurationType),
                                        IntervalCount = subscription.ValidityDuration - 1
                                    },
                                }
                         }
                });

        }

        return result.Id;

    }

    private async Task PaymentInitializationStart(StripePaymentInitializationDto request)
    {
        var entity = new StripePaymentInitialization
        {

            StripeRequestPayload = request.StripePayload,
            TransactionKeyId = request.TransKeyId,
            IsOneTimePayment = request.IsOneTimePayment,
            PaymentStatus = StripePaymentStatus.Pending,

        };
        await _nexusDbContext.AddAsync(entity);
        await _nexusDbContext.SaveChangesAsync();

    }

    private async Task PaymentInitializationStatusUpdate(StripePaymentInitializationStatusUpdateDto request)
    {
        var entity = await _nexusDbContext.StripePaymentInitializations.SingleOrDefaultAsync(x => x.TransactionKeyId == request.TransKeyId
        && (string.IsNullOrEmpty(x.StripePaymentSuccessPayload) && string.IsNullOrEmpty(x.StripePaymentErrorPayload)));
        if (entity != null)
        {
            entity.PaymentStatus = request.PaymentStatus;
            entity.StripePaymentSuccessPayload = request.StripePaymentSuccessPayload;
            entity.StripePaymentErrorPayload = request.StripePaymentErrorPayload;
            entity.StripeInvoiceId = request.StripeInvoiceId;
            entity.StripeSubscriptionId = request.StripeSubscriptionId;
            _nexusDbContext.Update(entity);
        }
        else
        {
            entity = new StripePaymentInitialization
            {
                StripeRequestPayload = string.Empty,
                TransactionKeyId = request.TransKeyId,
                IsOneTimePayment = false,
                PaymentStatus = request.PaymentStatus,
                StripePaymentSuccessPayload = request.StripePaymentSuccessPayload,
                StripePaymentErrorPayload = request.StripePaymentErrorPayload,
                StripeInvoiceId = request.StripeInvoiceId,
                StripeSubscriptionId = request.StripeSubscriptionId
            };
            await _nexusDbContext.AddAsync(entity);
        }

        await _nexusDbContext.SaveChangesAsync();

    }

    public async Task<GetPaymentStatusResponse> GetPaymentStatus(string transKey)
    {
        var entity = await _nexusDbContext.StripePaymentInitializations.OrderByDescending(x => x.Id).FirstOrDefaultAsync(x =>x.TransactionKeyId == transKey && x.TenantId == _currentUser.GetTenant());

        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "TransKey"));

        var stripeEvent = EventUtility.ParseEvent(entity.StripePaymentSuccessPayload);

        if (stripeEvent.Data.Object is not Invoice invoice) return null;

        var currencyType = Enum.Parse<StripeCurrencyType>(invoice.Currency.ToUpperInvariant());

        decimal convertedAmount = ConvertFromSmallestCurrency(currencyType, invoice.AmountPaid);

        return new GetPaymentStatusResponse
        {
            PaymentStatus = entity.PaymentStatus,
            Amount = convertedAmount,
            Currency = invoice.Currency
        };
    }

    public async Task<DownloadFileResponse> DownloadInvoice(DefaultIdType id)
    {
        var entity = await _nexusDbContext.TenantSubscriptionPlanInvoices.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Invoice"));


        var stripeEvent = EventUtility.ParseEvent(entity.StripeJsonPayload);

        if (stripeEvent.Data.Object is not Invoice invoice) throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Invoice"));
        var client = new RestClient(invoice.InvoicePdf);
        var request = new RestRequest();
        byte[]? response = await client.DownloadDataAsync(request);
        if(response == null || response.Length == 0)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Invoice PDF"));
        }

        string base64Pdf = Convert.ToBase64String(response);

        return new DownloadFileResponse
        {
            Name = $"Invoice_{invoice.Number}",
            FileBase64String = base64Pdf,
            Extension = "pdf"
        };
    }

}
