"""
Makes DJANGO_SETTINGS_MODULE environment variable required.
Loads it (and other variables) from from .env.
"""
import os
from dotenv import load_dotenv


def configure_from_dotenv():
    """
    Function to load dotenv file and pick the right settings.
    
    Make sure it is called in:
    - `manage.py`
    - `wsgi.py`
    """
    
    load_dotenv()

    try:
        DJANGO_SETTINGS_MODULE = os.environ["DJANGO_SETTINGS_MODULE"] 
    except KeyError:
        raise LookupError(
            "DJANGO_SETTINGS_MODULE environment variable not set. "
            "You can use .env file at BASE_PATH to set it."
        ) 