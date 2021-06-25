from django.apps import AppConfig


class PlaysConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quizzz.plays'     # full Python path to the application
    label = 'plays'           # short, unique name for the application
