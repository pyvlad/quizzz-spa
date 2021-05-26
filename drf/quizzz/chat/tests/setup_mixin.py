from quizzz.communities.tests.setup_mixin import SetupCommunityDataMixin
from quizzz.communities.models import Membership

from ..models import ChatMessage
from .data import EXTRA_MEMBERSHIPS, MESSAGES


class SetupChatDataMixin(SetupCommunityDataMixin):
    def set_up_community_and_chat_data(self):
        # set up users, communities and admin memberships:
        self.set_up_community_data()

        for membership in EXTRA_MEMBERSHIPS:
            Membership.objects.create(**membership)

        for message in MESSAGES:
            ChatMessage.objects.create(**message)

        self.messages = MESSAGES