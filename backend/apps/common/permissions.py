from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Anyone authenticated can view; only the object's owner/poster can edit."""

    owner_field = "owner"

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner_id_matches(owner, request.user)


def owner_id_matches(owner, user):
    return owner is not None and owner.pk == user.pk


class HasRole(permissions.BasePermission):
    """Restrict a whole viewset (or action) to specific account roles.
    Admins always pass. Usage: set `required_roles = {"ngo", "volunteer"}`
    on the view/viewset class.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "admin" or request.user.is_superuser:
            return True
        required = getattr(view, "required_roles", None)
        if not required:
            return True
        return request.user.role in required
