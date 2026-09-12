def notify(user, message, link=""):
    """Create a notification for a user. Import is local to avoid a circular
    import between apps.common and apps.notifications at app-loading time.
    """
    if user is None:
        return
    from apps.notifications.models import Notification
    Notification.objects.create(user=user, message=message, link=link)
