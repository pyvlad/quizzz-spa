# TODO: improve security of login/logout/register views
# By default, drf views are only protected if the client has authenticated:
# https://stackoverflow.com/questions/49275069/csrf-is-only-checked-when-authenticated-in-drf
# https://stackoverflow.com/a/47491560
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions

from .models import CustomUser
from .serializers import UserSerializer, NewUserSerializer, LoginSerializer


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
    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


# class CurrentUserDetail(APIView):
#     """
#     Return current user profile.
#     """
#     def get(self, request):
#         if request.user.is_anonymous:
#             return Response("Non authenticated user.", status=status.HTTP_401_UNAUTHORIZED)
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)


class UserCreate(APIView):
    """ 
    Create a new user.
    """
    def post(self, request):
        serializer = NewUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Login(APIView):
    """
    Log user in.
    """
    @method_decorator(never_cache)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = authenticate(username=data["username"], password=data["password"])
            if user is None:
                return Response("Wrong credentials", status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = UserSerializer(user)
                login(request._request, user)
                return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Logout(APIView):
    """
    Log user out.
    """
    def post(self, request):
        logout(request._request)
        return Response("Logged Out")