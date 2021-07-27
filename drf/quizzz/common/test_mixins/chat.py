from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import EXTRA_MEMBERSHIPS, MESSAGES

from quizzz.communities.models import Membership
from quizzz.chat.models import ChatMessage

from . import SetupCommunityDataMixin


class SetupChatDataMixin(SetupCommunityDataMixin):
    def set_up_community_and_chat_data(self):
        # set up users, communities and admin memberships:
        self.set_up_community_data()

        for membership in EXTRA_MEMBERSHIPS:
            Membership.objects.create(**membership)

        for message in MESSAGES:
            ChatMessage.objects.create(**message)
        update_pk_sequence(ChatMessage)

        self.messages = MESSAGES