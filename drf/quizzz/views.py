import time
from django.http import JsonResponse


def get_current_time(request):
    return JsonResponse({'time': time.time()*1000})