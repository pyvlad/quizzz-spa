from django.urls import path

from . import views


app_name = "quizzes"
urlpatterns = [
    path('', views.QuizListOrCreate.as_view(), name="quiz-list-create"),
    path('<int:quiz_id>/', views.QuizDetail.as_view(), name="quiz-detail"),
]