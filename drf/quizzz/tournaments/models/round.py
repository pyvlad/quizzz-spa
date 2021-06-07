from datetime import datetime

from django.db import models

from quizzz.quizzes.models import Quiz
from . import Tournament


class Round(models.Model):
    tournament = models.ForeignKey(
        Tournament, 
        related_name="rounds", 
        on_delete=models.CASCADE,
    )
    quiz = models.OneToOneField(Quiz, on_delete=models.CASCADE)
    # Conceptually, OneToOneField is similar to a ForeignKey with unique=True, 
    # but the “reverse” side of the relation will directly return a single object.
    # (or raise django.core.exceptions.RelatedObjectDoesNotExist - 
    # to avoid exception handling, use `hasattr(quiz, 'round')`)

    start_time = models.DateTimeField()
    finish_time = models.DateTimeField()

    class Meta:
        db_table = "rounds"
        indexes = [models.Index(fields=['finish_time'])]

    def __str__(self):
        return "Round [%r]" % (self.id,)

    @property
    def time_left(self):
        seconds_left = (self.finish_time - datetime.utcnow()).total_seconds()
        return {
            "days": int(seconds_left // (60 * 60 * 24)),
            "hours": int((seconds_left % (60 * 60 * 24)) // (60 * 60)),
            "minutes": int(((seconds_left % (60 * 60 * 24)) % (60 * 60)) // 60),
        }

    def get_status(self, now=None):
        if now is None:
            now = datetime.utcnow()
        if now < self.start_time:
            return "coming"
        elif now > self.finish_time:
            return "finished"
        else:
            return "current"

    @property
    def is_active(self):
        return self.get_status() == "current"

    def get_author_score(self):
        return len(self.plays.all())

    def is_authored_by(self, user_id):
        return self.quiz.user_id == user_id