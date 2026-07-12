using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Shared.Common.Validation;
[AttributeUsage(AttributeTargets.All, AllowMultiple = false)]
public class RequiredIfLessThanOrEqualZeroAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is int intValue && intValue <= 0) // use < 0 if you want zero to be allowed
        {
            // string displayName = validationContext.DisplayName ?? validationContext.MemberName;
            // return new ValidationResult(string.Format(ValidationMessages.RequiredMessageForDropDown, displayName));
            // return new ValidationResult(ValidationMessages.RequiredMessageForDropDown);

            return new ValidationResult(ValidationMessages.RequiredMessageForDropDown);
        }

        // null or > 0 is valid
        return ValidationResult.Success;
    }
}
