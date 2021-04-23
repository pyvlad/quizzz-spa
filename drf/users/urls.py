from django.urls import path
from . import views


app_name = "users"
urlpatterns = [
    path('', views.UserList.as_view(), name="list"),
    path('me/', views.CurrentUserDetail.as_view(), name="current-user"),
    path('register/', views.UserCreate.as_view(), name="register"),
    path('login/', views.Login.as_view(), name="login"),
    path('logout/', views.Logout.as_view(), name="logout"),
    path('time/', views.CurrentTime.as_view(), name="time"),
]