from rest_framework import exceptions
from rest_framework.views import set_rollback
from rest_framework.response import Response
from django.http import Http404
from django.core.exceptions import PermissionDenied


def custom_exception_handler(exc, context):
    """
    Customized copy of the default `rest_framework.views.exception_handler`.
    Changing format to a more unified one.

    Returns the response that should be used for any given exception.
    Any unhandled exceptions may return `None`, which will cause a 500 error
    to be raised.
    """
    # allow Django's built-in `Http404` and `PermissionDenied` exceptions, 
    # but turn them into custom subclasses of the `APIException`:
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, PermissionDenied):
        exc = exceptions.PermissionDenied()

    if isinstance(exc, exceptions.APIException):
        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait

        # Original code to monitor for changes:
        # if isinstance(exc.detail, (list, dict)):
        #     data = exc.detail
        # else:
        #     data = {'detail': exc.detail}

        payload = {'status_code': exc.status_code}

        if isinstance(exc.detail, (list, dict)):
            payload = {
                'detail': 'Bad request.',
                'form_errors': exc.detail,
            }
        else:
            payload = {
                'detail': exc.detail,
            }

        set_rollback()
        
        return Response(payload, status=exc.status_code, headers=headers)

    return None