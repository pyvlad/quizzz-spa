from django.urls import path
from . import views


app_name = "chat"
urlpatterns = [
    path('', views.ChatMessageList.as_view(), name="community-chat"),
    path('<int:message_id>/', views.ChatMessageDetail.as_view(), name="community-chat-message"),
]