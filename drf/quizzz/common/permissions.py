from rest_framework import permissions


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