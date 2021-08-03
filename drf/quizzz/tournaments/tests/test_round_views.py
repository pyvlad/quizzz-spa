import datetime
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from django.urls import reverse

from quizzz.common.test_mixins import SetupTournamentsMixin, SetupRoundsMixin

from quizzz.quizzes.models import Quiz
from ..models import Round


ROUND_EXPECTED_KEYS = [
    'id', 'start_time', 'finish_time', 'tournament', 
    'quiz', 'status', 'user_play_id', 'user_play_is_submitted', 'is_author'
]


class CreateRoundTest(SetupTournamentsMixin, APITestCase):
    def setUp(self):
        self.TOURNAMENT = "tournament1"
        self.TOURNAMENT_ID = self.TOURNAMENTS[self.TOURNAMENT]["id"]

        self.QUIZ = "quiz1"
        self.QUIZ_ID = self.QUIZZES[self.QUIZ]["id"]

        self.url = reverse(
            'tournaments:round-list-create', 
            kwargs={
                "community_id": self.GROUP_ID,
                "tournament_id": self.TOURNAMENT_ID,
            }
        )
        now = timezone.now()
        now = now.replace(second=0, microsecond=0)
        self.payload = {
            "start_time": now,
            "finish_time": now + datetime.timedelta(minutes=60),
            "quiz": self.QUIZ_ID,
        }
        self.expected_keys = ROUND_EXPECTED_KEYS

    def test_normal(self):
        """
        Group admin can create a new round.
        The view returns serialized new round.
        """
        init_count = Round.objects.count()

        get_response = lambda: self.client.post(self.url, self.payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        self.assertEqual(Round.objects.count(), init_count)

        # Group admin can create a new round, but need to finalize the quiz first:
        self.login_as("bob")
        with self.assertNumQueries(6):
            response = get_response()
            self.assert_validation_failed(response, data={
                "quiz": ["Quiz has not been submitted yet."]
            })

        # finalize quiz
        quiz = Quiz.objects.get(pk=self.payload["quiz"])
        quiz.is_finalized = True
        quiz.save()

        # now it works:
        with self.assertNumQueries(9):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)

        self.assertEqual(Round.objects.count(), init_count + 1)


    def test_bad_form(self):
        """
        'start_time', 'finish_time', 'quiz' are required fields.
        The view returns serialized new round.
        """
        bad_payload = {}

        self.login_as("bob")
        response = self.client.post(self.url, bad_payload)
        self.assert_validation_failed(response, data={
            "start_time": ["This field is required."],
            "finish_time": ["This field is required."],
            "quiz": ["This field is required."],
        })



class RoundListTest(SetupRoundsMixin, APITestCase):
    def setUp(self):
        self.TOURNAMENT = "tournament1"
        self.TOURNAMENT_ID = self.TOURNAMENTS[self.TOURNAMENT]["id"]

        self.url = reverse(
            'tournaments:round-list-create', 
            kwargs={
                "community_id": self.GROUP_ID,
                "tournament_id": self.TOURNAMENT_ID,
            }
        )
        self.expected_keys = ROUND_EXPECTED_KEYS

    def test_normal(self):
        """
        A group member can see list of rounds for a tournament.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        # a regular member sees the data
        self.login_as("alice")
        with self.assertNumQueries(5): # (3) member (4) rounds with quizzes and authors (5) my plays
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 1)
            self.assertListEqual(list(response.data[0].keys()), self.expected_keys)



class RoundDetailTest(SetupRoundsMixin, APITestCase):
    def setUp(self):
        self.ROUND = "round1"
        self.ROUND_ID = self.ROUNDS[self.ROUND]["id"]
        self.QUIZ_ID = self.ROUNDS[self.ROUND]["quiz_id"]

        # finalize quiz
        quiz = Quiz.objects.get(pk=self.QUIZ_ID)
        quiz.is_finalized = True
        quiz.save()

        self.url = reverse(
            'tournaments:round-detail',  
            kwargs={
                'community_id': self.GROUP_ID,
                'round_id': self.ROUND_ID,
            }
        )

        self.update_payload = self.ROUNDS[self.ROUND].copy()
        now = timezone.now()
        now = now.replace(second=0, microsecond=0)
        self.update_payload["start_time"] = now + datetime.timedelta(minutes=60)
        self.update_payload["finish_time"] = now + datetime.timedelta(minutes=120)
        self.update_payload["quiz"] = self.QUIZ_ID

        self.expected_keys = ROUND_EXPECTED_KEYS


    def test_get_round(self):
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        # alice is a group member, she sees the data:
        self.login_as("alice")
        with self.assertNumQueries(8):  # (3) member check (4) round (5) plays (6) quiz (7) user
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(
                list(response.data.keys()), 
                ["round", "standings"] # ["id", "user", "user_id", "result", "time", "score"]
            )
            self.assertEqual(list(response.data["round"].keys()), self.expected_keys)
            self.assertEqual(response.data["round"]["id"], self.ROUND_ID)


    def test_update_round_works_for_group_admins(self):
        get_response = lambda: self.client.put(self.url, self.update_payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        round = Round.objects.get(pk=self.ROUND_ID)
        self.assertNotEqual(round.start_time, self.update_payload["start_time"])
        self.assertNotEqual(round.finish_time, self.update_payload["finish_time"])

        # bob is a group admin, he can update the data:
        self.login_as("bob")
        with self.assertNumQueries(10):  
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
        
        round = Round.objects.get(pk=self.ROUND_ID)
        self.assertEqual(round.start_time, self.update_payload["start_time"])
        self.assertEqual(round.finish_time, self.update_payload["finish_time"])


    def test_delete_round_works_for_group_admins(self):
        get_response = lambda: self.client.delete(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        self.assertEqual(Round.objects.filter(pk=self.ROUND_ID).count(), 1)

        # bob is group admin, he can delete the round:
        self.login_as("bob")
        with self.assertNumQueries(6):
            # (4) select round (5) del round (6) del plays
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(response.data, None)

        self.assertEqual(Round.objects.filter(pk=self.ROUND_ID).count(), 0)