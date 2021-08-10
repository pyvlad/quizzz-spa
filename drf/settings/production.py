"""
Production environment settings.
"""
from .base import *


SECRET_KEY = get_secret("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = [get_secret('DOMAIN'), '.localhost', '127.0.0.1', '[::1]']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'quizzz',
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.PyLibMCCache',
        'LOCATION': '127.0.0.1:11211',
    }
}

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
]

# local send-only postfix server:
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = "localhost"
EMAIL_PORT = 25
EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""
EMAIL_USE_SSL = False
EMAIL_USE_TLS = False
EMAIL_TIMEOUT = 1 # seconds for blocking operations (e.g. connection attempt)
DEFAULT_FROM_EMAIL = f"Quizzz <no-reply@{get_secret('DOMAIN')}>"

# Custom project-specific settings:
QUIZZZ_QUESTIONS_PER_QUIZ = 10
QUIZZZ_OPTIONS_PER_QUESTION = 4
QUIZZZ_CHAT_PAGE_SIZE = 10
QUIZZZ_FRONTEND_BASE_URL = f"https://{get_secret('DOMAIN')}"