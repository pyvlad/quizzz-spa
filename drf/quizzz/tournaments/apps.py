from django.apps import AppConfig


class TournamentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quizzz.tournaments'     # full Python path to the application
    label = 'tournaments'           # short, unique name for the application
