from rest_framework import permissions
from .models import Membership


class AuthenticatedAsUrlUserId(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated
            and (view.kwargs["user_id"] == request.user.id))


class IsCommunityAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            membership = Membership.objects.get(
                user=request.user.id, 
                community_id=view.kwargs["community_id"]
            )
            return membership.is_admin
        except Membership.DoesNotExist:
            return False


class IsCommunityMember(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            Membership.objects.get(
                user=request.user.id, 
                community_id=view.kwargs["community_id"]
            )
            return True
        except Membership.DoesNotExist:
            return False


class IsSafeMethod(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in ('GET', 'HEAD', 'OPTIONS')


class IsDeleteMethod(permissions.BasePermission):    
    def has_permission(self, request, view):
        return request.method == "DELETE"