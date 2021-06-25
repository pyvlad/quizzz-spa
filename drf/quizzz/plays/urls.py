from django.urls import path

from . import views


app_name = "plays"
urlpatterns = [
    path(
        '<int:round_id>/start/', 
        views.StartRound.as_view(), 
        name="start-round"
    ),
    path(
        '<int:round_id>/submit/', 
        views.SubmitRound.as_view(), 
        name="submit-round"
    ),
    path(
        '<int:round_id>/review/',
        views.ReviewRound.as_view(), 
        name="review-round"
    )
]