from django.utils import timezone
from django.db import models
from django.apps import apps

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
        seconds_left = (self.finish_time - timezone.now()).total_seconds()
        return {
            "days": int(seconds_left // (60 * 60 * 24)),
            "hours": int((seconds_left % (60 * 60 * 24)) // (60 * 60)),
            "minutes": int(((seconds_left % (60 * 60 * 24)) % (60 * 60)) // 60),
        }

    def get_status(self, now=None):
        if now is None:
            now = timezone.now()
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

    def get_play_by_user_id(self, user_id):
        Play = apps.get_model('plays.Play')
        try:
            play = Play.objects.get(round__id = self.id, user__id = user_id)
        except Play.DoesNotExist:
            return None
        return play

    @property
    def user_play_id(self):
        try:
            return self.user_plays[0].id
        except IndexError:
            return None
        except AttributeError:
            raise AttributeError(
                'You must either use Prefetch with `to_attr=user_plays` '
                'or `self.load_user_plays(user_id)`.'
            )

    @property
    def user_play_is_submitted(self):
        try:
            return bool(self.user_plays[0].finish_time)
        except IndexError:
            return None
        except AttributeError:
            raise AttributeError(
                'You must either use Prefetch with `to_attr=user_plays` '
                'or `self.load_user_plays(user_id)`.'
            )

    @staticmethod
    def get_user_plays_prefetch_object(user_id):
        Play = apps.get_model('plays.Play')
        return models.Prefetch(
            'plays', 
            queryset=Play.objects.filter(user__id=user_id),
            to_attr="user_plays"
        )

    def load_user_plays(self, user_id):
        Play = apps.get_model('plays.Play')
        self.user_plays = list(Play.objects.filter(round__id=self.id, user__id=user_id))

    def get_standings(self):
        """
        Given <round> ORM object with pre-loaded <round.plays> and <play.user> related objects,
        calculate and return a jsonifiable list for the "standings" table.
        """
        Play = apps.get_model('plays.Play')
        play_objects = Play.objects\
            .filter(round__id=self.id)\
            .select_related("user")\
            .all()
        plays = [
            {
                "id": play.id,
                "user": play.user.username,
                "user_id": play.user.id,
                "result": play.result,
                "time": play.get_server_time(),
                "score": play.get_score()
            }
            for play in play_objects
        ]
        standings = sorted(plays, key=lambda x: x["score"], reverse=True)
        num_participants = len(standings)
        for i, play in enumerate(standings):
            play["points"] = num_participants - i

        return standings