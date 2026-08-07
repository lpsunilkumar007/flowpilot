using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Infrastructure.Orbit.CRM;

internal static class GpsVerificationHelper
{
    // Keep in sync with mobile VERIFICATION_THRESHOLD_METERS
    public const decimal VerificationThresholdMeters = 100000m;

    public static void Apply(
        GpsVerifications target,
        decimal gpsLatitude,
        decimal gpsLongitude,
        decimal? referenceLatitude,
        decimal? referenceLongitude)
    {
        if (referenceLatitude.HasValue && referenceLongitude.HasValue)
        {
            var distance = CalculateDistanceMeters(
                (double)referenceLatitude.Value,
                (double)referenceLongitude.Value,
                (double)gpsLatitude,
                (double)gpsLongitude);

            target.DistanceMeters = distance;
            target.Status = distance <= VerificationThresholdMeters
                ? VerificationStatus.Verified
                : VerificationStatus.Failed;
        }
        else
        {
            target.DistanceMeters = null;
            target.Status = VerificationStatus.Pending;
        }
    }

    public static decimal CalculateDistanceMeters(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusMeters = 6371000d;

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                + Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2))
                * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return (decimal)(earthRadiusMeters * c);
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180d;
}
