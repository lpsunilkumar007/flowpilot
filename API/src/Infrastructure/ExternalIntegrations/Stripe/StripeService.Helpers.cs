using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;
using Stripe;

namespace FlowPilot.Infrastructure.ExternalIntegrations.Stripe;
public partial class StripeService
{
    private long ConvertAmountToSmallestCurrency(StripeCurrencyType stripeCurrencyType, double amount)
    {
        if (amount <= 0)
            throw new BadRequestException("Amount must be greater than zero.");

        return stripeCurrencyType switch
        {
            StripeCurrencyType.USD => Convert.ToInt64(Math.Round(amount * 100, MidpointRounding.AwayFromZero)),

            // StripeCurrencyType.EUR => Convert.ToInt64(Math.Round(amount * 100, MidpointRounding.AwayFromZero)),
            // StripeCurrencyType.GBP => Convert.ToInt64(Math.Round(amount * 100, MidpointRounding.AwayFromZero)),

            StripeCurrencyType.INR => Convert.ToInt64(Math.Round(amount * 100, MidpointRounding.AwayFromZero)),

            // Zero-decimal currencies
            // StripeCurrencyType.JPY => Convert.ToInt64(Math.Round(amount, MidpointRounding.AwayFromZero)),
            // StripeCurrencyType.KRW => Convert.ToInt64(Math.Round(amount, MidpointRounding.AwayFromZero)),

            _ => throw new BadRequestException($"Currency {stripeCurrencyType} is not supported.")
        };
    }

    private string GetSubscriptionPlanPaymentCycleType(Domain.Enums.Nexus.Subscription.ValidityDurationType validityDurationType)
    {
        if(validityDurationType == Domain.Enums.Nexus.Subscription.ValidityDurationType.Months)
        {
            return "month";
        }
        else if (validityDurationType == Domain.Enums.Nexus.Subscription.ValidityDurationType.Years)
        {
            return "year";
        }
        else
        {
            throw new BadRequestException("Unsupported subscription plan payment cycle type.");
        }
    }

    private decimal ConvertFromSmallestCurrency(StripeCurrencyType stripeCurrencyType, long amount)
    {
        if (amount <= 0)
            return 0;

        return stripeCurrencyType switch
        {
            StripeCurrencyType.USD => amount / 100m,
            StripeCurrencyType.INR => amount / 100m,
            _ => throw new BadRequestException($"Currency {stripeCurrencyType} is not supported.")
        };
    }


}
