from rest_framework import permissions


class IsSuperuser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and request.user.is_superuser)


class AuthenticatedAsUrlUserId(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and 
            (view.kwargs["user_id"] == request.user.id)
        )