from rest_framework import permissions


class IsSafeMethod(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in ('GET', 'HEAD', 'OPTIONS')


class IsDeleteMethod(permissions.BasePermission):    
    def has_permission(self, request, view):
        return request.method == "DELETE"