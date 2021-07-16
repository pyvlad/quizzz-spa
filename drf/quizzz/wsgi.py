"""
WSGI config for quizzz project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""
from django.core.wsgi import get_wsgi_application
from settings import configure_from_dotenv

configure_from_dotenv()
application = get_wsgi_application()