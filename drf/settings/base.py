"""
Django settings for quizzz project.

Generated by 'django-admin startproject' using Django 3.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/

For the checklist for staging/production enviroment, see
https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/
"""
import json
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured


# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent


# JSON-based secrets module
try:
    with open(BASE_DIR / '.secrets.json') as f:
        secrets = json.load(f)
except FileNotFoundError:
    secrets = {}

def get_secret(setting):
    """
    Get the secret variable or return explicit exception.
    """
    try:
        return secrets[setting]
    except KeyError:
        raise ImproperlyConfigured(f'Set the {setting} secret variable')


# Application definition
INSTALLED_APPS = [
    # default
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # local
    'quizzz.common.apps.CommonConfig',
    'quizzz.users.apps.UsersConfig',
    'quizzz.communities.apps.CommunitiesConfig',
    'quizzz.chat.apps.ChatConfig',
    'quizzz.quizzes.apps.QuizzesConfig',
    'quizzz.tournaments.apps.TournamentsConfig',
    'quizzz.plays.apps.PlaysConfig',

    # 3rd party
    'rest_framework',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    'quizzz.membership_middleware.MembershipMiddleware',
]

ROOT_URLCONF = 'quizzz.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'quizzz.wsgi.application'


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'quizzz.password_validation.MaximumLengthValidator',
        'OPTIONS': {
            'max_length': 64,
        },
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



# It is highly recommended to set up a custom user model when starting a new Django project
# https://docs.djangoproject.com/en/3.1/topics/auth/customizing/#using-a-custom-user-model-when-starting-a-project
# The model referenced by AUTH_USER_MODEL must be created in the first migration 
# of its app (usually called 0001_initial); otherwise, you’ll have dependency issues.
AUTH_USER_MODEL = 'users.CustomUser' # (app_label, model_name)

REST_FRAMEWORK = {
    # By default, 'rest_framework.authentication.BasicAuthentication' is 
    # the first in the list. I remove it for clarity because I am using 
    # SessionAuthentication.
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],

    'EXCEPTION_HANDLER': 'quizzz.common.exceptions.custom_exception_handler',

    # Pagination is only performed automatically for generic views and viewsets:
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,

    # miltipart (default) uploads don't support nesting:
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',

    # add throttling for each user (when logged in) / IP (when not not logged in):
    'DEFAULT_THROTTLE_CLASSES': [
        'quizzz.throttles.BurstRateThrottle',
        'quizzz.throttles.SustainedRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'burst': '60/minute',
        'sustained': '1200/day',
        'login': '10/hour',
    }
}


# Custom project-specific settings:
QUIZZZ_PASSWORD_RESET_TOKEN_VALID_SECONDS = 3600
QUIZZZ_PASSWORD_RESET_REQUESTS_PER_EMAIL_PER_DAY = 3
QUIZZZ_CREATED_COMMUNITIES_LIMIT = 5
QUIZZZ_JOINED_COMMUNITIES_LIMIT = 20
QUIZZZ_ROUNDS_PER_TOURNAMENT_LIMIT = 100
QUIZZZ_CHAT_PAGE_SIZE = 2
QUIZZZ_QUESTIONS_PER_QUIZ = 2
QUIZZZ_OPTIONS_PER_QUESTION = 4

# for external links used when sending out emails:
QUIZZZ_FRONTEND_BASE_URL = "http://localhost:3000"