from django.db import models, transaction
from django.conf import settings

from quizzz.common.models import TimeStampedModel
from quizzz.communities.models import Community


class Quiz(TimeStampedModel):
    name = models.CharField(max_length=100, default="Anonymous Quiz")
    description = models.CharField(max_length=200, default="")
    introduction = models.CharField(max_length=200, default="")
    is_finalized = models.BooleanField(default=False)

    num_questions = models.IntegerField()
    num_options = models.IntegerField()

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)

    def __str__(self):
        return "<Quiz: %r [%r]>" % (self.name[:20], self.id)

    class Meta:
        db_table = "quizzes"
        verbose_name_plural = "quizzes"

    def init_questions(self):
        for _ in range(self.num_questions):             
            question = Question.objects.create(quiz=self)
            for _ in range(self.num_options):
                Option.objects.create(question=question)

    @classmethod
    def create_with_questions(cls, **kwargs):
        with transaction.atomic():
            quiz = cls(**kwargs)
            quiz.save()
            quiz.init_questions()
        return quiz


class Question(models.Model):
    text = models.CharField(max_length=1000, default="", blank=True)
    explanation = models.CharField(max_length=1000, default="", blank=True)
    
    quiz = models.ForeignKey(Quiz, 
        related_name="questions",
        related_query_name="question",
        on_delete=models.CASCADE
    )

    def __str__(self):
        return "<Question: %r [%r]>" % (self.text[:20], self.id)

    class Meta:
        db_table = "quiz_questions"



class Option(models.Model):
    text = models.CharField(max_length=1000, default="", blank=True)
    is_correct = models.BooleanField(default=False)

    question = models.ForeignKey(Question, 
        related_name="options",
        related_query_name="option",
        on_delete=models.CASCADE
    )

    def __str__(self):
        return "<Option %r [%r]>" % (
            self.text[:20] + (" (correct)" if self.is_correct else ""), self.id)

    class Meta:
        db_table = "quiz_question_options"