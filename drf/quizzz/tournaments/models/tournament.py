from django.db import models

from quizzz.common.models import TimeStampedModel
from quizzz.communities.models import Community


class Tournament(TimeStampedModel):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)

    community = models.ForeignKey(Community, related_name="tournaments", on_delete=models.CASCADE)
    # ForeignKey has db_index by default

    def __str__(self):
        return "[%r] %r" % (self.id, self.name)

    class Meta:
        db_table = "tournaments"
        indexes = [models.Index(fields=['time_created'])]
