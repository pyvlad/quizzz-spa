#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.

`manage.py` does the same thing as `django-admin` but also sets 
the `DJANGO_SETTINGS_MODULE` environment variable so that 
it points to your project’s `settings.py` file.
"""
import sys
from settings import configure_from_dotenv


def main():
    """
    Run administrative tasks.
    """
    configure_from_dotenv()

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
