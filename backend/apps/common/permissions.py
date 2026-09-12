from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsVerifiedOrganization(BasePermission):
    """
    Reusable permission to ensure that NGO and Blood Bank accounts
    cannot perform protected actions until is_verified=True.

    Does NOT block receiver, donor, volunteer, or general user accounts.
    Admin/staff users are always permitted.
    """
    message = "Your organization account is pending administrator verification."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Staff and admins are always permitted
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or getattr(user, 'role', None) == 'admin':
            return True

        # NGO and Blood Bank roles MUST be verified
        role = getattr(user, 'role', None)
        if role in ['ngo', 'blood_bank']:
            return bool(getattr(user, 'is_verified', False))

        # Receivers, donors, volunteers, and general users are not blocked by this rule
        return True

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsVerifiedOrganizationOrReadOnly(BasePermission):
    """
    Allows read-only access (GET, HEAD, OPTIONS) to any authenticated user,
    but enforces that NGO and Blood Bank accounts must be verified (is_verified=True)
    before performing write/mutation actions.

    Does NOT block receiver, donor, volunteer, or general user accounts.
    """
    message = "Your organization account is pending administrator verification."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)

        user = request.user
        if not user or not user.is_authenticated:
            return False

        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or getattr(user, 'role', None) == 'admin':
            return True

        role = getattr(user, 'role', None)
        if role in ['ngo', 'blood_bank']:
            return bool(getattr(user, 'is_verified', False))

        return True

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
