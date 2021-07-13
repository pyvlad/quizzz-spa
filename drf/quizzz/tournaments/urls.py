from django.urls import path

from . import views


app_name = "tournaments"
urlpatterns = [
    path(
        '', 
        views.TournamentListOrCreate.as_view(), 
        name="tournament-list-create"
    ),
    path(
        '<int:tournament_id>/', 
        views.TournamentDetail.as_view(), 
        name="tournament-detail"
    ),
    path(
        '<int:tournament_id>/rounds/', 
        views.RoundListOrCreate.as_view(), 
        name="round-list-create"
    ),
    path(
        '<int:tournament_id>/standings/', 
        views.TournamentStandings.as_view(), 
        name="tournament-standings"
    ),
    path(
        'rounds/<int:round_id>/', 
        views.RoundDetail.as_view(), 
        name="round-detail"
    ),
    path(
        'quiz-pool/', 
        views.QuizPool.as_view(), 
        name="quiz-pool"
    ),
]