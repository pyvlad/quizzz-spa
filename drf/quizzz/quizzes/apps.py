from django.apps import AppConfig


class QuizzesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quizzz.quizzes'     # full Python path to the application
    label = 'quizzes'           # short, unique name for the application
