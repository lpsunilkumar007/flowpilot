using FlowPilot.Application.ExternalIntegrations.Stripe.Models.Request;
using FlowPilot.Application.ExternalIntegrations.Stripe.Models.Response;
using Stripe;

namespace FlowPilot.Host.Controllers.Subscription;

public partial class SubscriptionController
{
    [HttpPost("payment/create-intent")]
    public async Task<CreateIntentResponse> CreateIntent(CreateIntentRequest request)
    {
        return await _stripeService.CreateIntent(request);
    }

    [HttpPost("payment/get-payment-status/{transKey}")]
    public async Task<GetPaymentStatusResponse> GetPaymentStatus(string transKey)
    {
        return await _stripeService.GetPaymentStatus(transKey);
    }

    [AllowAnonymous]
    [HttpPost("stripe/web-hook")]
    public async Task<IActionResult> StripeWebhook()
    {
        string json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"];
        try
        {
            EventUtility.ValidateSignature(json, signature, _webhookSecret);
            await _stripeService.HandleStripeEventAsync(json);
            return Ok();
        }
        catch (StripeException)
        {
            return BadRequest();
        }
    }

}
