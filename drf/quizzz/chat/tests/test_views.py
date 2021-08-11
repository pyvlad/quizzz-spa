from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from quizzz.common.test_mixins import SetupChatDataMixin

from ..models import ChatMessage
from ..views import ChatMessageList


CHAT_PAGE_EXPECTED_KEYS = ['count', 'next', 'previous', 'results']
MESSAGE_EXPECTED_KEYS = ['id', 'text', 'time_created', 'time_updated', 'user', "community", "round"]


class ChatMessageListTest(SetupChatDataMixin, APITestCase):

    def _load_group_messages(self):
        return ChatMessage.objects.filter(community_id=self.GROUP_ID).all()

    def setUp(self):
        self.num_messages = len(self._load_group_messages())
        # pagination and deletion below assume self.num_messages is 2 and pk = [1,2]
          
        self.url = reverse('chat:community-chat', 
            kwargs={ "community_id": self.GROUP_ID }
        )
        self.payload = {"text": "new message"}
        self.chat_page_expected_keys = CHAT_PAGE_EXPECTED_KEYS
        self.message_expected_keys = MESSAGE_EXPECTED_KEYS


    def test_normal(self):
        """
        Group members can see group chat.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        # works for a regular group member
        self.login_as("alice")
        with self.assertNumQueries(5):  
            # (1-2) request.user (3) member check (4) count(*) for pagination (5) select page 1
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["next"], None)
            self.assertEqual(response.data["previous"], None)
            self.assertEqual(response.data["count"], self.num_messages)
            self.assertEqual(len(response.data["results"]), self.num_messages)
            self.assertListEqual(list(response.data.keys()), self.chat_page_expected_keys)
            self.assertListEqual(list(response.data["results"][0].keys()), self.message_expected_keys)

    def test_pagination(self):
        """
        Test how pagination works:
        - `count` shows total number of messages in group chat;
        - `next` and `previous` are either None or a absolute URL with next/previous page;
        - `results` contains list of paginated objects.
        """
        self.login_as("alice")
        
        TEMP_PAGE_SIZE = 1
        # temporarily modify pagination settings, see:
        # https://github.com/encode/django-rest-framework/blob/bc075212cb05a52a2b2b2b4c909cfbd03c7ebd8e/rest_framework/generics.py#L158
        ORIGINAL_PAGE_SIZE = ChatMessageList.pagination_class.page_size
        ChatMessageList.pagination_class.page_size = TEMP_PAGE_SIZE
        
        # 1st page
        response = self.client.get(self.url)

        self.assertEqual(response.data["count"], self.num_messages)
        self.assertEqual(response.data["next"], "http://testserver" + self.url + "?page=2")
        self.assertEqual(response.data["previous"], None)
        self.assertEqual(len(response.data["results"]), TEMP_PAGE_SIZE)

        # 2nd page
        response = self.client.get(response.data["next"])
        
        self.assertEqual(response.data["count"], self.num_messages)
        self.assertEqual(response.data["next"], None)
        self.assertEqual(response.data["previous"], "http://testserver" + self.url)
        self.assertEqual(len(response.data["results"]), TEMP_PAGE_SIZE)

        # restore original pagination settings:
        ChatMessageList.pagination_class.page_size = ORIGINAL_PAGE_SIZE


    def test_post_new_message(self):
        """
        A group member can post a new chat message.
        It returns a new message's serialized representation.
        """
        get_response = lambda: self.client.post(self.url, self.payload)
        
        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        self.assertEqual(len(self._load_group_messages()), self.num_messages)

        # A regular group member can leave a new message:
        self.login_as("alice")
        with self.assertNumQueries(4):  # (1-2) request.user (3) membership check (4) insert
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertListEqual(list(response.data.keys()), self.message_expected_keys)
        
        self.assertEqual(len(self._load_group_messages()), self.num_messages + 1)


    def test_delete_message_works_for_group_admins(self):
        def get_message_url(pk):
            return reverse(
                'chat:community-chat-message', 
                kwargs={"community_id": self.GROUP_ID, "message_id": pk}
            )

        get_response = lambda pk: self.client.delete(get_message_url(pk))

        for pk in [1,2]:
            self.assert_authentication_required(lambda: get_response(pk))
            self.assert_membership_required(lambda: get_response(pk))
            self.assert_group_admin_rights_required(lambda: get_response(pk))

        self.assertEqual(len(self._load_group_messages()), self.num_messages)

        # bob is group admin, he can delete messages:
        self.login_as("bob")

        for pk in [1,2]:
            with self.assertNumQueries(5):
                response = get_response(pk)
                self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
                self.assertEqual(response.data, None)

        # both group1 messages are no longer in the DB:
        self.assertEqual(len(self._load_group_messages()), self.num_messages - 2)