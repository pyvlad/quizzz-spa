from datetime import datetime

from django.db import models
from django.conf import settings

from . import Round


class Play(models.Model):
    __tablename__ = "plays"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    round = models.ForeignKey(Round, related_name="plays", on_delete=models.CASCADE)

    is_submitted = models.BooleanField(default=False)
    result = models.IntegerField()

    start_time = models.DateTimeField(auto_now_add=True)
    finish_time = models.DateTimeField()

    client_start_time = models.DateTimeField()
    client_finish_time = models.DateTimeField()

    def __str__(self):
        return "<Play of %r by %r [%r]>" % (self.round_id, self.user.username, self.user_id)

    class Meta:
        db_table = "plays"

    # alternative 1 (sqlite only):
    # server_started = sa.Column(sa.DateTime, server_default=text("(STRFTIME('%Y-%m-%d %H:%M:%f000', 'NOW'))"))
    # server_updated = sa.Column(sa.DateTime, onupdate=text("STRFTIME('%Y-%m-%d %H:%M:%f000', 'NOW')"))
    # alternative 2 (lacks precision):
    # server_started = sa.Column(sa.DateTime, server_default=func.now())
    # server_updated = sa.Column(sa.DateTime, onupdate=func.now())

    def get_server_time(self):
        if self.finish_time is None or self.start_time is None:
            return None
        return (self.finish_time - self.start_time).total_seconds()

    def get_client_time(self):
        if self.client_finish_time is None or self.client_start_time is None:
            return None
        return (self.client_finish_time - self.client_start_time).total_seconds()

    def get_result(self):
        return len([answer.option.is_correct for answer in self.answers.all()])

    def get_score(self):
        if self.result and self.get_server_time():
            return max(0, 100 * self.result - self.get_server_time())
        else:
            return 0