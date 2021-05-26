# TODO: improve security of login/logout/register views
# By default, drf views are only protected if the client has authenticated:
# https://stackoverflow.com/questions/49275069/csrf-is-only-checked-when-authenticated-in-drf
# https://stackoverflow.com/a/47491560
from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions

from .models import CustomUser
from .serializers import UserSerializer, NewUserSerializer, LoginSerializer
from .permissions import IsSuperuser


class CurrentTime(APIView):
    """
    View that returns current time for authenticated users.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import time
        return Response({'time': time.time()*1000})


class UserList(APIView):
    """ 
    List all users.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        IsSuperuser,
    ]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserCreate(APIView):
    """ 
    Create a new user.
    """
    def post(self, request):
        serializer = NewUserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)


class Login(APIView):
    """
    Log user in.
    """
    @method_decorator(never_cache)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            data = serializer.validated_data
            login(request._request, data["user"])
            serializer = UserSerializer(data["user"])
            return Response(serializer.data)


class Logout(APIView):
    """
    Log user out.
    """
    def post(self, request):
        logout(request._request)
        return Response()