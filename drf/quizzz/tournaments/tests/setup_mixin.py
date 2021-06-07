from quizzz.quizzes.tests.setup_mixin import SetupQuizDataMixin

from ..models import Tournament, Round
from .data import TOURNAMENTS, ROUNDS


class SetupTournamentDataMixin(SetupQuizDataMixin):
    def set_up_tournament_data(self):
        self.set_up_quiz_data()
        Tournament.objects.create(**TOURNAMENTS["tournament1"])
        self.tournament = TOURNAMENTS["tournament1"]
        
    def set_up_tournament_and_round_data(self):
        self.set_up_tournament_data()
        Round.objects.create(**ROUNDS["round1"])
        self.round = ROUNDS["round1"]