from quizzz.tournaments.models import Round

from .data import ROUNDS
from . import SetupTournamentsMixin


class SetupRoundsMixin(SetupTournamentsMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()
        cls.set_up_quiz_data()
        cls.set_up_tournaments()
        cls.set_up_rounds()

    @classmethod
    def set_up_rounds(cls):
        Round.objects.create(**ROUNDS["round1"])
        cls.update_pk_sequence(Round)
        cls.ROUNDS = ROUNDS