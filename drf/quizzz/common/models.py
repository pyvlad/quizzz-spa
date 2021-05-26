from django.db import models


class TimeStampedModel(models.Model):
    time_created = models.DateTimeField(auto_now_add=True)
    time_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True