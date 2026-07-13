using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Shared.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace FlowPilot.Infrastructure.Notifications;
public class NotificationSender : INotificationSender
{
    private readonly IHubContext<NotificationHub> _notificationHubContext;
    private readonly ICurrentUser _currentUser;
    public const string NotificationFromServer = nameof(NotificationFromServer);

    public NotificationSender(IHubContext<NotificationHub> notificationHubContext, ICurrentUser currentUser) =>
        (_notificationHubContext, _currentUser) = (notificationHubContext, currentUser);

    public Task BroadcastAsync(INotificationMessage notification, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.All
            .SendAsync(NotificationFromServer, notification.GetType().Name, notification, cancellationToken);

    public Task BroadcastAsync(INotificationMessage notification, IEnumerable<string> excludedConnectionIds, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.AllExcept(excludedConnectionIds)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public Task SendToAllAsync(INotificationMessage notification, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.Group($"GroupTenant-{_currentUser.GetTenantUniqueId()}")
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public Task SendToAllAsync(INotificationMessage notification, IEnumerable<string> excludedConnectionIds, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.GroupExcept($"GroupTenant-{_currentUser.GetTenantUniqueId()}", excludedConnectionIds)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public Task SendToGroupAsync(INotificationMessage notification, string group, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.Group(group)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public Task SendToGroupAsync(INotificationMessage notification, string group, IEnumerable<string> excludedConnectionIds, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.GroupExcept(group, excludedConnectionIds)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public Task SendToGroupsAsync(INotificationMessage notification, IEnumerable<string> groupNames, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.Groups(groupNames)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public async Task SendToUserAsync(INotificationMessage notification, string userId, CancellationToken cancellationToken) =>
       await _notificationHubContext.Clients.User(userId)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);

    public Task SendToUsersAsync(INotificationMessage notification, IEnumerable<string> userIds, CancellationToken cancellationToken) =>
        _notificationHubContext.Clients.Users(userIds)
            .SendAsync(NotificationFromServer, notification.GetType().FullName, notification, cancellationToken);
}
