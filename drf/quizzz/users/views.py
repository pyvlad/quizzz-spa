"""
Authentication/Registration views.

Notes on CSRF-protection of login/logout/register views

By default, drf views have CSRF protection when the client has authenticated:
    CSRF validation in REST framework works slightly differently to standard Django 
    due to the need to support both session and non-session based authentication 
    to the same views. This means that only authenticated requests require CSRF tokens, 
    and anonymous requests may be sent without CSRF tokens. This behaviour is not suitable 
    for login views, which should always have CSRF validation applied.
    [https://www.django-rest-framework.org/api-guide/authentication/#sessionauthentication]
Besides, the session cookie has 'SameSite' flag set to 'lax' 
(via settings.SESSION_COOKIE_SAMESITE) which prevents it from being sent 
in CSRF-prone request methods (e.g. POST) from external websites.

Anonymous requests can be sent without CSRF tokens, which makes publicly available
views (most views here) vulnerable to CSRF attacks, e.g. 
https://en.wikipedia.org/wiki/Cross-site_request_forgery#Forging_login_requests

Some hints for a potential solution (if this ever becomes an issue):
https://stackoverflow.com/questions/49275069/csrf-is-only-checked-when-authenticated-in-drf
https://stackoverflow.com/a/47491560
https://github.com/encode/django-rest-framework/blob/master/rest_framework/views.py#L144
https://github.com/encode/django-rest-framework/blob/master/rest_framework/authentication.py#L112-L142
https://github.com/encode/django-rest-framework/issues/6104
https://github.com/encode/django-rest-framework/issues/6795
"""
from django.contrib.auth import login, logout, get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework.serializers import ValidationError

from .models import CustomUser
from .serializers import (
    UserSerializer, NewUserSerializer, LoginSerializer, 
    UserEmailSerializer, UserPasswordSerializer,
)
from .permissions import IsSuperuser
from .helpers import (
    validate_email_confirmation_token, send_confirmation_email, 
    get_password_reset_token, send_password_reset_email,
)
from quizzz.common.permissions import IsAuthenticated



class Login(APIView):
    """
    Log user in.
    """
    @method_decorator(never_cache)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data["user"]
            login(request._request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data)


class Logout(APIView):
    """
    Log user out.
    """
    def post(self, request):
        logout(request._request)
        return Response()


class UserCreate(APIView):
    """ 
    Register new user and automatically log in.
    """
    def post(self, request):
        serializer = NewUserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()

            login(request._request, user)
            send_confirmation_email(user)

            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConfirmEmailLink(APIView):
    """
    Check the token submitted as part of the url (previously sent via email)
    and, on success, return a new user object with `is_email_confirmed` flag 
    toggled to `True`.
    """
    def get(self, request, token):
        if request.user.is_authenticated and request.user.is_email_confirmed:
            serializer = UserSerializer(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        user = validate_email_confirmation_token(token)
        if user:
            user.is_email_confirmed = True
            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            raise ValidationError("Bad token.")


class ResendConfirmEmail(APIView):
    """
    Fulfil request to send a new token to confirm email.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.is_email_confirmed:
           return Response(status=status.HTTP_403_FORBIDDEN)

        send_confirmation_email(request.user)
        return Response(status=status.HTTP_200_OK)


class RequestPasswordResetEmail(APIView):
    """
    Fulful request to send an email with password reset instructions 
    to the email address specified as part of payload.
    Return 200 OK on success.
    """
    @method_decorator(never_cache)
    def post(self, request):
        serializer = UserEmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.validated_data["email"]
            user = get_object_or_404(get_user_model().objects.filter(email=email))
            
            if user.is_superuser:
                raise ValidationError("Superuser password cannot be reset.")

            send_password_reset_email(user)

            return Response(status=status.HTTP_200_OK)


class ResetPassword(APIView):
    """
    Check the token corresponding to the tokenUUID submitted as part of url
    (previusly sent via email) and, on success, change the user's password 
    to the one submitted as part of request payload.
    """
    @method_decorator(never_cache)
    def post(self, request, token_uuid):
        token = get_password_reset_token(token_uuid)
        if not token:
            raise Http404
        
        valid_seconds = settings.QUIZZZ_PASSWORD_RESET_TOKEN_VALID_SECONDS
        if (token.was_used or token.has_expired(valid_seconds=valid_seconds)):
            raise Http404
            
        user = token.user
        serializer = UserPasswordSerializer(user, data=request.data)
        if serializer.is_valid(raise_exception=True):
            # save new password:
            serializer.save()

            # deactivate token:
            token.was_used = True
            token.save()

            return Response(status=status.HTTP_200_OK)


class UserList(APIView):
    """ 
    List all users.
    """
    permission_classes = [ IsAuthenticated, IsSuperuser ]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)