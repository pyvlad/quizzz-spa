from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import EXTRA_MEMBERSHIPS, MESSAGES

from quizzz.communities.models import Membership
from quizzz.chat.models import ChatMessage

from . import SetupCommunityDataMixin


class SetupChatDataMixin(SetupCommunityDataMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()
        cls.set_up_chat_data()

    @classmethod
    def set_up_chat_data(cls):
        for membership in EXTRA_MEMBERSHIPS:
            Membership.objects.create(**membership)

        for message in MESSAGES:
            ChatMessage.objects.create(**message)

        update_pk_sequence(ChatMessage)

        cls.messages = MESSAGES