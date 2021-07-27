from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from quizzz.common import test_utils
from quizzz.common.test_mixins import SetupChatDataMixin

from ..models import ChatMessage
from ..views import ChatMessageList


class ChatMessageListTest(SetupChatDataMixin, APITestCase):

    def setUp(self):
        self.community_id = self.communities["group1"]["id"]
        self.community_messages = [
            m for m in self.messages 
            if m["community_id"]==self.community_id
        ]
        self.url = reverse('chat:community-chat', kwargs={"community_id": self.community_id})
        
        self.expected_keys = ['id', 'text', 'time_created', 'time_updated', 'user', "community"]

        self.new_message = {"text": "new message"}


    def test_normal(self):
        """
        Group members can see group chat.
        """
        # anonymous users cannot access
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # non-group members cannot access
        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # group-members can access
        self.login_as("alice")
        with self.assertNumQueries(5):  
            # (1-2) request.user (3) member check (4) count(*) for pagination (5) select page 1
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], len(self.community_messages))
        self.assertEqual(response.data["next"], None)
        self.assertEqual(response.data["previous"], None)
        self.assertEqual(len(response.data["results"]), len(self.community_messages))
        self.assertListEqual(list(response.data["results"][0].keys()), self.expected_keys)

    def test_pagination(self):
        self.login_as("alice")
        
        TEMP_PAGE_SIZE = 1
        # temporarily modify pagination settings, see:
        # https://github.com/encode/django-rest-framework/blob/bc075212cb05a52a2b2b2b4c909cfbd03c7ebd8e/rest_framework/generics.py#L158
        ORIGINAL_PAGE_SIZE = ChatMessageList.pagination_class.page_size
        ChatMessageList.pagination_class.page_size = TEMP_PAGE_SIZE
        
        # 1st page
        response = self.client.get(self.url)
        
        self.assertEqual(response.data["count"], len(self.community_messages))
        self.assertEqual(response.data["next"], "http://testserver" + self.url + "?page=2")
        self.assertEqual(response.data["previous"], None)
        self.assertEqual(len(response.data["results"]), TEMP_PAGE_SIZE)

        # 2nd page
        response = self.client.get(response.data["next"])
        
        self.assertEqual(response.data["count"], len(self.community_messages))
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
        # Anonymous users cannot post messages:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, self.new_message)
        test_utils.assert_403_not_authenticated(self, response)

        # Non-group members cannot leave messages:
        self.login_as("ben")
        with self.assertNumQueries(3):  # (1-2) request.user (3) membership check
            response = self.client.post(self.url, self.new_message)
        test_utils.assert_403_not_authorized(self, response)

        # make sure no messages have been inserted into DB:
        self.assertEqual(ChatMessage.objects.count(), len(self.messages))

        # Group members can leave new messages:
        self.login_as("bob")
        with self.assertNumQueries(4):  # (1-2) request.user (3) membership check (4) insert
            response = self.client.post(self.url, self.new_message)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertListEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(ChatMessage.objects.count(), len(self.messages) + 1)


    def test_delete_message_works_for_group_admins(self):
        def get_message_url(pk):
            return reverse(
                'chat:community-chat-message', 
                kwargs={"community_id": self.community_id, "message_id": pk}
            )

        # anonymous users cannot delete messages
        with self.assertNumQueries(0):
            response = self.client.delete(get_message_url(1))
        test_utils.assert_403_not_authenticated(self, response)

        # alice a regular group1 member, she cannot delete neither her nor bob's message:
        self.login_as("alice")
        for pk in [1,2]:
            with self.assertNumQueries(3):
                response = self.client.delete(get_message_url(pk))
            test_utils.assert_403_not_authorized(self, response)

        # ben is not a group member at all, he cannot delete the data either:
        self.login_as("ben")
        for pk in [1,2]:
            with self.assertNumQueries(3):
                response = self.client.delete(get_message_url(pk))
            test_utils.assert_403_not_authorized(self, response)

        # make sure no messages have been deleted from the DB:
        self.assertEqual(ChatMessage.objects.count(), len(self.messages))

        # bob is group admin, he can delete messages:
        self.login_as("bob")

        for pk in [1,2]:
            with self.assertNumQueries(5):
                response = self.client.delete(get_message_url(pk))
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(response.data, None)

        # both group1 messages are no longer in the DB:
        self.assertEqual(ChatMessage.objects.filter(community__name="group1").count(), 0)