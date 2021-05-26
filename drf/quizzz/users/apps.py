from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quizzz.users'       # full Python path to the application
    label = 'users'             # short, unique name for the application
