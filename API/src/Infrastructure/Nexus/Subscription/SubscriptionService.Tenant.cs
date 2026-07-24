using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.MultiTenant.Models.Response;
using FlowPilot.Application.Nexus.Subscription.Models;
using FlowPilot.Application.Nexus.Subscription.Models.Response;
using FlowPilot.Domain.Enums.Nexus.Subscription;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Stripe;

namespace FlowPilot.Infrastructure.Nexus.Subscription;

public partial class SubscriptionService
{

    public async Task<AssignSubscriptionPlanResponse> AssignSubscriptionPlan(AssignSubscriptionPlanDto request)
    {
        var tenant = await _nexusDbContext.Tenants.FirstOrDefaultAsync(t => t.UniqueId == request.TenantUniqueId);

        var subscriptionPlan = await _nexusDbContext.Subscriptions.FirstOrDefaultAsync(x => x.Id == request.SubscriptionPlanId);
        _ = subscriptionPlan ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Subscription Plan"));

        TentantSubscriptionPlan assignedSubscription = new TentantSubscriptionPlan
        {
            FkTenantPKId = tenant.Id,
            SubscriptionPlanPaymentCycleType = subscriptionPlan.SubscriptionPlanPaymentCycleType,
            FKSubscriptionPlanPKId = subscriptionPlan.Id,
            Name = subscriptionPlan.Name,
            Price = subscriptionPlan.Price,
            ValidityDurationType = subscriptionPlan.ValidityDurationType,
            ValidityDuration = subscriptionPlan.ValidityDuration,
            Description = subscriptionPlan.Description,
            ExpiredOn = CalculateExpiredDateTime(subscriptionPlan.ValidityDuration, subscriptionPlan.ValidityDurationType, _dateTimeService.UtcNow),
            IsActive = true,
            SubscriptionPlanPaymentStatus = request.IsDefaultViaRegistration ? SubscriptionPlanPaymentStatus.Default : SubscriptionPlanPaymentStatus.Active,

            StripeSubscriptionId = request.IsDefaultViaRegistration ? null : request.StripeSubscriptionId,
            StripeSubscriptionSchedulerId = request.IsDefaultViaRegistration ? null : request.StripeSubscriptionSchedulerId,
            StripePriceId = request.IsDefaultViaRegistration ? null : request.StripePriceId,
        };

        await _nexusDbContext.TenantSubscriptionPlans.AddAsync(assignedSubscription);
        await _nexusDbContext.SaveChangesAsync();

        if (!string.IsNullOrEmpty(request.StripeJsonPayload))
        {
            var stripe = EventUtility.ParseEvent(request.StripeJsonPayload);
            var invoiceData = stripe.Data.Object as Invoice;
            var invoicePeriod = invoiceData.Lines.Data[0].Period;

            if (assignedSubscription.ValidityDuration > 1)
            {
                DateTime periodFrom = DateTime.Now;// initialPayment.PeriodTo;
                DateTime periodTo = DateTime.Now;
                for (int i = 0; i < assignedSubscription.ValidityDuration; i++)
                {
                    TentantSubscriptionPlanInvoices installment;
                    if (i == 0)
                    {
                        installment = new TentantSubscriptionPlanInvoices
                        {
                            FkTentantSubscriptionPlanPKId = assignedSubscription.Id,
                            PeriodFrom = invoicePeriod.Start.Date, // get from stripe
                            PeriodTo = invoicePeriod.End.Date, // get from stripe
                            StripeInvoiceId = invoiceData.Id, // invoice id
                            StripeJsonPayload = request.StripeJsonPayload,
                            StripePaymentStatus = "Paid",
                            StripeInvoiceUrl = invoiceData.HostedInvoiceUrl
                        };

                        periodTo = invoicePeriod.End.Date;
                        await _nexusDbContext.TenantSubscriptionPlanInvoices.AddAsync(installment);
                    }
                    else
                    {
                        periodTo = CalculateTimePeriodTo(1, subscriptionPlan.ValidityDurationType, periodFrom);
                        installment = new TentantSubscriptionPlanInvoices
                        {
                            FkTentantSubscriptionPlanPKId = assignedSubscription.Id,
                            PeriodFrom = periodFrom,
                            PeriodTo = periodTo,
                            StripePaymentStatus = "Pending",
                            StripeInvoiceUrl = string.Empty
                        };
                        await _nexusDbContext.TenantSubscriptionPlanInvoices.AddAsync(installment);
                    }

                    periodFrom = periodTo;
                }
            }

            await _nexusDbContext.SaveChangesAsync();
        }

        var subscriptionsToUpdate = _nexusDbContext.TenantSubscriptionPlans
              .Where(s => s.IsActive == true && s.FkTenantPKId == tenant.Id && s.Id != assignedSubscription.Id)
              .ToList();

        foreach (var oldSub in subscriptionsToUpdate)
        {
            // check if we need to change status to finish
            oldSub.IsActive = false;
        }

        _nexusDbContext.TenantSubscriptionPlans.UpdateRange(subscriptionsToUpdate);
        await _nexusDbContext.SaveChangesAsync();

        return new AssignSubscriptionPlanResponse
        {
            Id = assignedSubscription.Id,
            Message = string.Format(SuccessMessages.RecordAddedSuccessfully, assignedSubscription.Name)
        };
    }

    public async Task<bool> IsInitialPayment(string stripeSubscriptionId)
    {
        return !(await _nexusDbContext.TenantSubscriptionPlans.AnyAsync(x => x.StripeSubscriptionId == stripeSubscriptionId));
    }

    private DateTimeOffset CalculateExpiredDateTime(int validationDuration, ValidityDurationType validityDurationType, DateTimeOffset currentDateTime)
    {
        switch (validityDurationType)
        {
            //case ValidityDurationType.Days:
            //    currentDateTime = currentDateTime.AddDays(validationDuration);
            //    break;

            case ValidityDurationType.Months:
                currentDateTime = currentDateTime.AddMonths(validationDuration);
                break;

            case ValidityDurationType.Years:
                currentDateTime = currentDateTime.AddYears(validationDuration);
                break;

            default:
                throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Validation Duration Type"));
        }

        return currentDateTime;
    }

    private DateTime CalculateTimePeriodTo(int validationDuration, ValidityDurationType validityDurationType, DateTime periodFrom)
    {
        periodFrom = periodFrom.Date;

        return validityDurationType switch
        {
            ValidityDurationType.Months =>
                periodFrom.AddMonths(validationDuration),

            ValidityDurationType.Years =>
                periodFrom.AddYears(validationDuration),

            _ => throw new NotFoundException(
                string.Format(ErrorMessages.ItemNotFound, "Validation Duration Type"))
        };
    }

    public async Task UpdateTenantSubscriptionPlanInvoice(string stripeJsonPayload, string stripePaymentStatus)
    {
        var stripe = EventUtility.ParseEvent(stripeJsonPayload);
        var invoiceData = stripe.Data.Object as Invoice;
        var invoicePeriod = invoiceData.Lines.Data[0].Period;
        string stripSubscriptionId = invoiceData.Parent.SubscriptionDetails.SubscriptionId;

        var entity = await _nexusDbContext.TenantSubscriptionPlans.Include(x => x.TentantSubscriptionPlanInvoices).SingleAsync(x => x.StripeSubscriptionId == stripSubscriptionId);
        if (entity == null) throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "TenantSubscriptionPlan"));

        foreach (var item in entity.TentantSubscriptionPlanInvoices)//.Where(x => x.StripePaymentStatus != "Paid").ToList())
        {
            if (item.PeriodFrom == invoicePeriod.Start.Date &&
            item.PeriodTo == invoicePeriod.End.Date)
            {
                item.StripePaymentStatus = stripePaymentStatus;// "Paid";
                item.StripeInvoiceId = invoiceData.Id;
                item.StripeJsonPayload = stripeJsonPayload;
                item.StripeInvoiceUrl = invoiceData.HostedInvoiceUrl;
                _nexusDbContext.TenantSubscriptionPlanInvoices.Update(item);
                break;
            }
        }

        await _nexusDbContext.SaveChangesAsync();
    }

    public async Task<TenantCurrentSubscriptionDetailResponse> GetTenantCurrentSubscriptionDetail()
    {
        var today = new DateTimeOffset(_dateTimeService.UtcNow.UtcDateTime.Date, TimeSpan.Zero);
        var entity = await _nexusDbContext.TenantSubscriptionPlans.Include(x => x.TentantSubscriptionPlanInvoices).Where(x => x.FkTenantPKId == _currentUser.GetTenant() && x.IsActive && !x.IsDeleted)
    .OrderByDescending(x => x.Id)
    .Select(x => new TenantCurrentSubscriptionDetailResponse
    {
        ExpiredOn = x.ExpiredOn,
        Name = x.Name,
        Price = x.Price,
        FKSubscriptionPlanPKId = x.FKSubscriptionPlanPKId,
        IsOverDue = x.TentantSubscriptionPlanInvoices.Any(i => i.StripePaymentStatus == "Pending" && i.PeriodFrom.Date <= today),
        PaymentPending = x.TentantSubscriptionPlanInvoices.Where(i => i.StripePaymentStatus == "Pending" && i.PeriodFrom.Date <= today).Select(i => i.PeriodFrom).FirstOrDefault(),
        LatePaymentOverDue = x.TentantSubscriptionPlanInvoices.Any(i => i.StripePaymentStatus == "Failed" || (i.StripePaymentStatus == "Pending" && i.PeriodFrom.Date <= today)),
        Invoices = x.TentantSubscriptionPlanInvoices
            .Where(i => i.PeriodFrom.Date <= today)
            .Select(i => new TenantInvoicesResponse
            {
                InvoiceId = i.Id,
                PeriodFrom = i.PeriodFrom,
                PeriodTo = i.PeriodTo,
                InvoiceStatus = i.StripePaymentStatus,
                StripeInvoiceUrl = i.StripeInvoiceUrl

            }).OrderByDescending(x => x.InvoiceId).ToList()
    })
.FirstOrDefaultAsync();

        if (entity == null)
        {
            entity = new TenantCurrentSubscriptionDetailResponse
            {
                ExpiredOn = DateTime.Now.AddMonths(-5),
                Name = "----",
                Price = -100,
                IsOverDue = true,
                FKSubscriptionPlanPKId = 0,
                LatePaymentOverDue = true,
                Invoices = new List<TenantInvoicesResponse>()

            };
        }


        return entity;

    }

    public async Task<List<GetTenantSubscriptionResponse>> GetTenantSubscriptionsAsync(DefaultIdType? id)
    {
        var query = _nexusDbContext.TenantSubscriptionPlans.Include(x => x.TentantSubscriptionPlanInvoices).AsQueryable();

        var userService = _provider.GetRequiredService<IUserService>();
        bool isRootTenant = await userService.HasPermissionAsync(_currentUser.GetUserId().ToString(), SystemAction.View, SystemResource.Tenants, new CancellationToken());

        if (!id.HasValue || !isRootTenant)
        {
            query = query.Where(x => x.FkTenantPKId == _currentUser.GetTenant());
        }
        else
        {
            query = query.Where(x => x.FkTenantPKId == id);
        }

        return await query.OrderByDescending(x => x.Id)
            .Select(x => new GetTenantSubscriptionResponse
            {
                TenantSubscriptionId = x.Id,
                TenantSubscriptionName = x.Name,
                TenantSubscriptionDescription = x.Description,
                ValidityDuration = x.ValidityDuration,
                ValidityDurationType = x.ValidityDurationType,
                IsActive = x.IsActive,
                StripeSubscriptionId = x.StripeSubscriptionId,
                StripeSubscriptionSchedulerId = x.StripeSubscriptionSchedulerId,
                ExpiredOn = x.ExpiredOn,
                Price = x.Price,
                TenantSubscriptionInvoiceResponses = x.TentantSubscriptionPlanInvoices
            .Select(i => new TenantSubscriptionInvoiceResponse
            {
                StripeInvoiceId = i.StripeInvoiceId,
                StripePaymentStatus = i.StripePaymentStatus,
                TenantSubscriptionInvoiceId = i.Id,
                PeriodFrom = i.PeriodFrom,
                PeriodTo = i.PeriodTo,
            })
            .ToList()
            }).ToListAsync();

    }

}