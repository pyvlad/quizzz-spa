from rest_framework import permissions


class IsAuthenticated(permissions.BasePermission):
    """
    Allows access only to authenticated users.
    Same as default permissions.isAuthenticated, but also checks user.is_email_confirmed.
    https://github.com/encode/django-rest-framework/blob/master/rest_framework/permissions.py#L131
    """
    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.is_email_confirmed
        )


class IsSafeMethod(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in ('GET', 'HEAD', 'OPTIONS')


class IsDeleteMethod(permissions.BasePermission):    
    def has_permission(self, request, view):
        return request.method == "DELETE"


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `user` attribute meaning for the owner.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id