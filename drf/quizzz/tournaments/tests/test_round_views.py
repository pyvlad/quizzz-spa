import datetime
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from django.urls import reverse

from quizzz.common import test_utils

from ..models import Round
from .setup_mixin import SetupTournamentDataMixin
from quizzz.quizzes.tests.data import QUIZZES


class CreateRoundTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]

        self.url = reverse(
            'tournaments:round-list-create', 
            kwargs={
                "community_id": self.community_id,
                "tournament_id": self.tournament["id"],
            }
        )
        now = timezone.now()
        now = now.replace(second=0, microsecond=0)
        self.payload = {
            "start_time": now,
            "finish_time": now + datetime.timedelta(minutes=60),
            "quiz": QUIZZES["quiz1"]["id"],
        }


    def test_normal(self):
        """
        Group admin can create a new round.
        The view returns serialized new round.
        """
        init_count = Round.objects.count()

        # Non-admins cannot create rounds:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, self.payload)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, self.payload)
        test_utils.assert_403_not_authorized(self, response)

        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, self.payload)
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Round.objects.count(), init_count)

        # Group admin can create a new round:
        self.login_as("bob")
        with self.assertNumQueries(6):
            response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertListEqual(
            list(response.data.keys()), 
            ['id', 'start_time', 'finish_time', 'tournament', 'quiz']
        )
        self.assertEqual(Round.objects.count(), init_count + 1)


    def test_bad_form(self):
        """
        'start_time', 'finish_time', 'quiz' are required fields.
        The view returns serialized new round.
        """
        self.login_as("bob")

        bad_payload = {}
        response = self.client.post(self.url, bad_payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], 'Bad data submitted.')
        errors = response.data["data"]
        self.assertEqual(str(errors['start_time'][0]), 'This field is required.')
        self.assertEqual(str(errors['finish_time'][0]), 'This field is required.')
        self.assertEqual(str(errors['quiz'][0]), 'This field is required.')



class RoundListTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_and_round_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'tournaments:round-list-create', 
            kwargs={
                "community_id": self.community_id,
                "tournament_id": self.tournament["id"],
            }
        )

    def test_normal(self):
        """
        A group member can see list of rounds for a tournament.
        """
        # Anonymous user cannot see round list:
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # Non-members cannot see round list:
        self.login_as("ben")
        with self.assertNumQueries(4):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # Members see tournament rounds:
        self.login_as("alice")
        with self.assertNumQueries(5): # (3) member (4) round (5) quiz
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertListEqual(
            list(response.data[0].keys()), 
            ['id', 'start_time', 'finish_time', 'tournament', 'quiz'],
        )



class RoundDetailTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_and_round_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'tournaments:round-detail',  
            kwargs={
                'community_id': self.communities["group1"]["id"],
                'round_id': self.round["id"],
            }
        )
        self.new_data = self.round.copy()
        now = timezone.now()
        now = now.replace(second=0, microsecond=0)
        self.new_data["start_time"] = now + datetime.timedelta(minutes=60)
        self.new_data["finish_time"] = now + datetime.timedelta(minutes=120)
        self.new_data["quiz"] = self.round["quiz_id"]
        self.expected_keys = ["id", "start_time", "finish_time", "tournament", "quiz"]

    def test_get_round(self):
        # anonymous users have no access:
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # ben is not a group member, he sees nothing:
        self.login_as("ben")
        with self.assertNumQueries(4):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # alice is a group member, she sees the data:
        self.login_as("alice")
        with self.assertNumQueries(5):  # (3) member check (4) round (5) quiz
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["id"], self.round['id'])


    def test_update_round_works_for_group_admins(self):
        # non-admins have no access:
        with self.assertNumQueries(0):
            response = self.client.put(self.url, self.new_data)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data)
        test_utils.assert_403_not_authorized(self, response)

        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data)
        test_utils.assert_403_not_authorized(self, response)     

        round = Round.objects.get(pk=self.round["id"])
        self.assertNotEqual(round.start_time, self.new_data["start_time"])
        self.assertNotEqual(round.finish_time, self.new_data["finish_time"])

        # bob is a group admin, he can update the data:
        self.login_as("bob")
        with self.assertNumQueries(7):
            # (3) is admin check (4) select round (5) select quiz (6) quiz unique (7) update  
            response = self.client.put(self.url, self.new_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        
        round = Round.objects.get(pk=1)
        self.assertEqual(round.start_time, self.new_data["start_time"])
        self.assertEqual(round.finish_time, self.new_data["finish_time"])


    def test_delete_round_works_for_group_admins(self):
        # non-admins have no access:
        with self.assertNumQueries(0):
            response = self.client.delete(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.put(self.url)
        test_utils.assert_403_not_authorized(self, response)

        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.put(self.url)
        test_utils.assert_403_not_authorized(self, response)     

        self.assertEqual(Round.objects.filter(pk=self.round["id"]).count(), 1)

        # bob is group admin, he can delete the round:
        self.login_as("bob")
        with self.assertNumQueries(5):
            # (4) select round (5) del round
            response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Round.objects.filter(pk=self.round["id"]).count(), 0)