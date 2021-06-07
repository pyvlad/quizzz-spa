import datetime
from django.utils import timezone

from quizzz.users.tests.data import USERS
from quizzz.communities.tests.data import COMMUNITIES
from quizzz.quizzes.tests.data import QUIZZES


now = timezone.now()
now = now.replace(second=0, microsecond=0)


TOURNAMENTS = {
    "tournament1": {
        "id": 1,
        "name": "Tournament 1",
        "is_active": True,
        "community_id": COMMUNITIES["group1"]["id"],
    }
}

ROUNDS = {
    "round1": {
        "id": 1,
        "start_time": now,
        "finish_time": now + datetime.timedelta(minutes=60),
        "tournament_id": TOURNAMENTS["tournament1"]["id"],
        "quiz_id": QUIZZES["quiz1"]["id"],
    }
}