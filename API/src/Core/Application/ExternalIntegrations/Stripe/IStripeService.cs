using FlowPilot.Application.ExternalIntegrations.Stripe.Models.Request;
using FlowPilot.Application.ExternalIntegrations.Stripe.Models.Response;
using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;

namespace FlowPilot.Application.ExternalIntegrations.Stripe;
public interface IStripeService : ITransientService
{
    Task<CreateIntentResponse> CreateIntent(CreateIntentRequest request);

    Task HandleStripeEventAsync(string jsonPayload);

    Task<GetPaymentStatusResponse> GetPaymentStatus(string transKey);

    Task<DownloadFileResponse> DownloadInvoice(DefaultIdType id);
}
