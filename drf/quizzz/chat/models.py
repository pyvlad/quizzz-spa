from django.db import models
from django.conf import settings

from quizzz.common.models import TimeStampedModel
from quizzz.communities.models import Community


class ChatMessage(TimeStampedModel):
    text = models.CharField(max_length=1000)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)

    def __str__(self):
        return "[%r] %r" % (self.id, self.text[:20])

    class Meta:
        db_table = "chat_messages"
        indexes = [models.Index(fields=['time_created'])]
        # A database index is automatically created on the ForeignKey,
        # - no need to specify db_index=True for 'user' and 'community' fields.