using System.Globalization;
using System.Linq;

namespace FlowPilot.Infrastructure.Orbit.Import.Helpers;

internal static class ImportValueParser
{
    public static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static bool IsValidEmail(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var email = value.Trim();
        var at = email.IndexOf('@');
        if (at <= 0 || at != email.LastIndexOf('@') || at == email.Length - 1)
        {
            return false;
        }

        var domain = email[(at + 1)..];
        return !email.Contains(' ') && domain.Contains('.') && domain[^1] != '.';
    }

    public static bool IsValidMobile(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var digitCount = value.Count(char.IsDigit);
        return digitCount is >= 10 and <= 15;
    }

    public static bool TryParseBool(string? value, out bool result)
    {
        result = false;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var normalized = value.Trim();
        if (normalized.Equals("yes", StringComparison.OrdinalIgnoreCase)
            || normalized.Equals("y", StringComparison.OrdinalIgnoreCase)
            || normalized.Equals("true", StringComparison.OrdinalIgnoreCase)
            || normalized.Equals("1", StringComparison.OrdinalIgnoreCase))
        {
            result = true;
            return true;
        }

        if (normalized.Equals("no", StringComparison.OrdinalIgnoreCase)
            || normalized.Equals("n", StringComparison.OrdinalIgnoreCase)
            || normalized.Equals("false", StringComparison.OrdinalIgnoreCase)
            || normalized.Equals("0", StringComparison.OrdinalIgnoreCase))
        {
            result = false;
            return true;
        }

        return false;
    }

    public static bool TryParseDecimal(string? value, out decimal result)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            result = 0;
            return false;
        }

        var cleaned = value.Trim().Replace(",", string.Empty, StringComparison.Ordinal);
        return decimal.TryParse(cleaned, NumberStyles.Number, CultureInfo.InvariantCulture, out result)
            || decimal.TryParse(cleaned, NumberStyles.Number, CultureInfo.CurrentCulture, out result);
    }

    public static bool TryParseInt(string? value, out int result) =>
        int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out result)
        || int.TryParse(value, NumberStyles.Integer, CultureInfo.CurrentCulture, out result);

    public static bool TryParseEnum<TEnum>(string? value, out TEnum result)
        where TEnum : struct, Enum
    {
        result = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var normalized = ImportColumnMatcher.Normalize(value);
        foreach (var name in Enum.GetNames<TEnum>())
        {
            if (ImportColumnMatcher.Normalize(name) == normalized)
            {
                result = Enum.Parse<TEnum>(name);
                return true;
            }
        }

        return Enum.TryParse(value.Trim(), ignoreCase: true, out result);
    }

    public static bool TryParseDate(string? value, out DateTimeOffset result)
    {
        result = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        return DateTimeOffset.TryParse(value.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out result)
            || DateTimeOffset.TryParse(value.Trim(), CultureInfo.CurrentCulture, DateTimeStyles.AssumeUniversal, out result);
    }

    public static string FormatBool(bool value) => value ? "Yes" : "No";

    public static string FormatDecimal(decimal? value) =>
        value.HasValue ? value.Value.ToString(CultureInfo.InvariantCulture) : string.Empty;
}
