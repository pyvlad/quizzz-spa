"""
Local development settings.
"""
from .base import *


SECRET_KEY = "django-insecure-vrn(6)$*i*f0vbuv2l(qb9+-)i*@e3df^+suxvxdv$91++zq*9"

# When DEBUG is True and ALLOWED_HOSTS is empty, the host is validated 
# against ['.localhost', '127.0.0.1', '[::1]'].
DEBUG = True
ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'quizzz',
        'TEST': {
            'NAME': 'quizzz-tests',
            # to allow db creation (from postgres): ALTER USER user1 CREATEDB;
        },
    }
}
# # Uncomment for faster tests with in-memory SQLite:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


# Email
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging
# LOGGING = {
#     'version': 1,
#     'filters': {
#         'require_debug_true': {
#             '()': 'django.utils.log.RequireDebugTrue',
#         }
#     },
#     'handlers': {
#         'console': {
#             'level': 'DEBUG',
#             'filters': ['require_debug_true'],
#             'class': 'logging.StreamHandler',
#         }
#     },
#     'loggers': {
#         'django.db.backends': {
#             'level': 'DEBUG',
#             'handlers': ['console'],
#         }
#     }
# }