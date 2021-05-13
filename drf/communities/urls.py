from django.urls import path
from . import views


app_name = "communities"
urlpatterns = [
    path('communities/', 
        views.CommunityList.as_view(), name="community-list"),
    path('create-community/',
        views.CreateCommunity.as_view(), name="create-community"),
    path('join-community/',
        views.JoinCommunity.as_view(), name="join-community"),
    path('communities/<int:community_id>/', 
        views.CommunityDetail.as_view(), name="community-detail"),
    path('communities/<int:community_id>/members/', 
        views.MembershipList.as_view(), name="community-members"),
    path('communities/<int:community_id>/members/<int:user_id>/',
        views.MembershipDetail.as_view(), name="membership-detail"),

    path('users/<int:user_id>/communities/',
        views.UserCommunityList.as_view(), name="user-communities"),
]