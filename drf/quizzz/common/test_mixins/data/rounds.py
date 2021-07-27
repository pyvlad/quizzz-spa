import datetime
from django.utils import timezone

from . import TOURNAMENTS, QUIZZES


now = timezone.now()
now = now.replace(second=0, microsecond=0)


ROUNDS = {
    "round1": {
        "id": 1,
        "start_time": now,
        "finish_time": now + datetime.timedelta(minutes=60),
        "tournament_id": TOURNAMENTS["tournament1"]["id"],
        "quiz_id": QUIZZES["quiz1"]["id"],
    }
}