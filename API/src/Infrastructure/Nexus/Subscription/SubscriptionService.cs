using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Subscription;
using FlowPilot.Application.Nexus.Subscription.Models.Request;
using FlowPilot.Application.Nexus.Subscription.Models.Response;
using FlowPilot.Domain.Enums.Nexus.Subscription;
using FlowPilot.Infrastructure.Nexus.Subscription.DbModels;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Nexus;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.Subscription;
public partial class SubscriptionService : ISubscriptionService
{
    private readonly NexusDbContext _nexusDbContext;
    private readonly IDateTimeService _dateTimeService;
    private readonly ICurrentUser _currentUser;
    private readonly IServiceProvider _provider;

    public SubscriptionService(NexusDbContext nexusBaseDbContext, IDateTimeService dateTimeService, ICurrentUser currentUser, IServiceProvider provider)
    {
        _nexusDbContext = nexusBaseDbContext;
        _dateTimeService = dateTimeService;
        _currentUser = currentUser;
        _provider = provider;
    }

    public async Task<int> GetRootAdminSubscriptionIdAsync()
    {
        var result = await _nexusDbContext.Subscriptions.SingleOrDefaultAsync(x => x.Name == NexusConstants.Root.SubscriptionPlanNameForRootAdmin);
        if (result == null) return (await _nexusDbContext.Subscriptions.FirstAsync()).Id;
        return result.Id;
    }

    public async Task<int> GetRegisteredUserDefaultSubscriptionAsync()
    {
        var result = await _nexusDbContext.Subscriptions.OrderByDescending(x => x.Id).FirstOrDefaultAsync(x => x.IsDefaultForRegistration);
        if (result == null) return (await _nexusDbContext.Subscriptions.FirstAsync()).Id;
        return result.Id;
    }

    public async Task SeedSubscriptions()
    {
        if (await _nexusDbContext.Subscriptions.AnyAsync())
        {
            return;
        }

        var entity = new CreateSubscriptionRequest()
        {
            Name = NexusConstants.Root.SubscriptionPlanNameForRootAdmin,
            Price = 0,
            ValidityDuration = 365,
            ValidityDurationType = ValidityDurationType.Years,
            Description = NexusConstants.Root.SubscriptionPlanNameForRootAdmin,
            DisplayOrder = -1,
            SubscriptionPlanStatusType = SubscriptionPlanStatusTypes.Deactive,
            RibbonText = string.Empty,
            IsDefaultForRegistration = false,
            SubscriptionPlanPaymentCycleType = SubscriptionPlanPaymentCycleTypes.OneTime
        };

        await CreateSubscriptionPlanDetailsAsync(entity);

        entity = new CreateSubscriptionRequest()
        {
            Name = "Default For New User Registration",
            Price = 0,
            ValidityDuration = 1,
            ValidityDurationType = ValidityDurationType.Months,
            Description = "Default For New User Registration",
            DisplayOrder = -1,
            SubscriptionPlanStatusType = SubscriptionPlanStatusTypes.Active,
            RibbonText = string.Empty,
            IsDefaultForRegistration = true,
            SubscriptionPlanPaymentCycleType = SubscriptionPlanPaymentCycleTypes.Free,
        };

        await CreateSubscriptionPlanDetailsAsync(entity);

    }

    public async Task<List<GetSubscriptionPlanDetailsResponse>> GetAllSubscriptionDetailsForAnonymousUsers()
    {
        var entity = _nexusDbContext.Subscriptions.Where(x =>
        x.SubscriptionPlanStatusType == SubscriptionPlanStatusTypes.Active)
            .Select(x => new GetSubscriptionPlanDetailsResponse
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                ValidityDuration = x.ValidityDuration,
                ValidityDurationType = x.ValidityDurationType,
                Description = x.Description,
                DisplayOrder = x.DisplayOrder,
                RibbonText = x.RibbonText,
                IsDefaultForRegistration = x.IsDefaultForRegistration,
            });

        return await entity.ToListAsync();
    }

    public async Task<string> CreateSubscriptionPlanDetailsAsync(CreateSubscriptionRequest request)
    {
        var entity = new Subscriptions()
        {
            Name = request.Name,
            Price = request.Price,
            ValidityDuration = request.ValidityDuration,
            ValidityDurationType = request.ValidityDurationType,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            SubscriptionPlanStatusType = request.SubscriptionPlanStatusType,
            RibbonText = request.RibbonText,
            IsDefaultForRegistration = request.IsDefaultForRegistration,
            SubscriptionPlanPaymentCycleType = request.SubscriptionPlanPaymentCycleType
        };

        if (request.IsDefaultForRegistration)
        {
            var subscriptionsToUpdate = _nexusDbContext.Subscriptions
                .Where(s => s.IsDefaultForRegistration)
                .ToList();

            foreach (var subscription in subscriptionsToUpdate)
            {
                subscription.IsDefaultForRegistration = false;
            }
        }

        await _nexusDbContext.AddAsync(entity);
        await _nexusDbContext.SaveChangesAsync();

        return SuccessMessages.RecordAddedSuccessfully;
    }

}
