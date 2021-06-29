from collections import defaultdict
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

    def get_standings(self):
        points_total = defaultdict(int)
        points_played = defaultdict(int)
        points_authored = defaultdict(int)
        rounds_total = defaultdict(int)
        rounds_played = defaultdict(int)
        rounds_authored = defaultdict(int)
        user_names = {}

        for round in self.rounds.all():
            round_standings = round.get_standings()
            for r in round_standings:
                user_id = r["user_id"]
                rounds_total[user_id] += 1
                rounds_played[user_id] += 1
                points_total[user_id] += r["points"]
                points_played[user_id] += r["points"]
                user_names[user_id] = user_names.get(user_id, r["user"])
            author_id = round.quiz.user_id
            if author_id:
                rounds_total[author_id] += 1
                rounds_authored[author_id] += 1
                points_total[author_id] += round.get_author_score()
                points_authored[author_id] += round.get_author_score()
                user_names[author_id] = user_names.get(author_id) or round.quiz.user.username

        standings = [
            {
                "user_id": x[0],
                "user": user_names[x[0]],
                "points": x[1],
                "rounds": rounds_total[x[0]],
                "points_played": points_played.get(x[0], 0),
                "points_authored": points_authored.get(x[0], 0),
                "rounds_played": rounds_played.get(x[0], 0),
                "rounds_authored": rounds_authored.get(x[0], 0)
            } for x in sorted(points_total.items(), key=lambda x:x[1], reverse=True)
        ]

        return standings