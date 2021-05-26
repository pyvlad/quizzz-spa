from django.urls import path

from . import views


app_name = "communities"
urlpatterns = [
    path('', 
        views.CommunityList.as_view(), name="community-list"),
    path('create/',
        views.CreateCommunity.as_view(), name="create-community"),
    path('join/',
        views.JoinCommunity.as_view(), name="join-community"),
    path('<int:community_id>/', 
        views.CommunityDetail.as_view(), name="community-detail"),
    path('<int:community_id>/members/', 
        views.MembershipList.as_view(), name="community-members"),
    path('<int:community_id>/members/<int:user_id>/',
        views.MembershipDetail.as_view(), name="membership-detail"),

    path('user-memberships/<int:user_id>/',
        views.UserCommunityList.as_view(), name="user-communities"),
]