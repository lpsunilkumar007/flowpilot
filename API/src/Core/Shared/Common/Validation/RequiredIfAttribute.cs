using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Shared.Common.Validation;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class RequiredIfAttribute : ValidationAttribute
{
    public RequiredIfAttribute(string dependentProperty, object? dependentValue)
    {
        DependentProperty = dependentProperty;
        DependentValue = dependentValue;
        ErrorMessage = ValidationMessages.RequiredMessageForDropDown;
    }

    public string DependentProperty { get; }

    public object? DependentValue { get; }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var containerType = validationContext.ObjectInstance.GetType();
        var field = containerType.GetProperty(DependentProperty);
        if (field is null)
        {
            return ValidationResult.Success;
        }

        var dependentValue = field.GetValue(validationContext.ObjectInstance);
        var conditionMet = Equals(dependentValue, DependentValue)
            || (DependentValue is bool expectedBool
                && dependentValue is bool actualBool
                && expectedBool == actualBool);

        if (!conditionMet)
        {
            return ValidationResult.Success;
        }

        if (value is null || (value is string text && string.IsNullOrWhiteSpace(text)))
        {
            return new ValidationResult(
                ErrorMessage ?? ValidationMessages.RequiredMessageForDropDown,
                validationContext.MemberName is null ? null : [validationContext.MemberName]);
        }

        return ValidationResult.Success;
    }
}
