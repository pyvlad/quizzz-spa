from django.db import models

from . import Play
from quizzz.quizzes.models import Question
from quizzz.quizzes.models import Option


class PlayAnswer(models.Model):

    play = models.ForeignKey(Play, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name="answers", on_delete=models.CASCADE) 
    option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True, blank=True)
    # user can give no answer to a question

    class Meta:
        db_table = "play_answers"

    def __repr__(self):
        return "<PlayAnswer [%r]>" % self.id