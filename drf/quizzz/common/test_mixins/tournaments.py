from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import TOURNAMENTS, ROUNDS

from quizzz.tournaments.models import Tournament, Round

from . import SetupQuizDataMixin


class SetupTournamentDataMixin(SetupQuizDataMixin):
    def set_up_tournament_data(self):
        self.set_up_quiz_data()
        Tournament.objects.create(**TOURNAMENTS["tournament1"])
        update_pk_sequence(Tournament)
        self.tournament = TOURNAMENTS["tournament1"]
        
    def set_up_tournament_and_round_data(self):
        self.set_up_tournament_data()
        Round.objects.create(**ROUNDS["round1"])
        update_pk_sequence(Round)
        self.round = ROUNDS["round1"]