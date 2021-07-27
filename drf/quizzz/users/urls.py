from django.urls import path
from . import views


app_name = "users"
urlpatterns = [
    path('all/', views.UserList.as_view(), name="list"),
    path('register/', views.UserCreate.as_view(), name="register"),
    path('login/', views.Login.as_view(), name="login"),
    path('logout/', views.Logout.as_view(), name="logout"),

    path('confirm-email/<token>/', views.ConfirmEmailLink.as_view(), name="confirm-email-link"),
    path('resend-confirm-email/', views.ResendConfirmEmail.as_view(), name='resend-confirm-email'),
    path(
        'request-password-reset-email/', 
        views.RequestPasswordResetEmail.as_view(), 
        name="request-password-reset-email"
    ),
    path(
        'password-reset/<token_uuid>/',
        views.ResetPassword.as_view(),
        name="password-reset"
    )
]