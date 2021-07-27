from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import TOURNAMENTS

from quizzz.tournaments.models import Tournament

from . import SetupQuizDataMixin


class SetupTournamentsMixin(SetupQuizDataMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()
        cls.set_up_quiz_data()
        cls.set_up_tournaments()

    @classmethod
    def set_up_tournaments(cls):
        Tournament.objects.create(**TOURNAMENTS["tournament1"])
        update_pk_sequence(Tournament)
        cls.tournament = TOURNAMENTS["tournament1"]