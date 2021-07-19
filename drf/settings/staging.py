"""
Staging environment settings.
"""
from .base import *


SECRET_KEY = get_secret("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = ['.localhost', '127.0.0.1', '[::1]']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'quizzz',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# To view emails in logs:
# journalctl -u quizzz.service --no-pager

QUIZZZ_FRONTEND_BASE_URL = "https://localhost:8443"