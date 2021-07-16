"""
Staging environment settings.
"""
from .base import *


SECRET_KEY = get_secret("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = ['.localhost', '127.0.0.1', '[::1]']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

QUIZZZ_FRONTEND_BASE_URL = "https://localhost:8443"