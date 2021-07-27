from quizzz.chat.models import ChatMessage

from .data import MESSAGES
from . import SetupCommunityDataMixin


class SetupChatDataMixin(SetupCommunityDataMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()
        cls.set_up_chat_data()

    @classmethod
    def set_up_chat_data(cls):
        for message in MESSAGES:
            ChatMessage.objects.create(**message)
        cls.update_pk_sequence(ChatMessage)
        cls.MESSAGES = MESSAGES