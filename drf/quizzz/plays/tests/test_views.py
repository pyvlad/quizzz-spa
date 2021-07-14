from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from quizzz.common import test_utils

from ..models import Play, PlayAnswer
from quizzz.tournaments.tests.setup_mixin import SetupTournamentDataMixin



class StartRoundTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_and_round_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]

        self.url = reverse(
            'plays:start-round', 
            kwargs={
                "community_id": self.community_id,
                "round_id": self.round["id"],
            }
        )
    
    def test_normal(self):
        """
        Group member can start a new round.
        The view returns serialized quiz with questions.
        """
        init_count = Play.objects.count()

        # Non-admins cannot create rounds:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Play.objects.count(), init_count)

        # Alice is a group member, she can play the round:
        self.login_as("alice")
        with self.assertNumQueries(12):
            response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            list(response.data.keys()), 
            ['name', 'introduction', 'questions']
        )
        self.assertEqual(len(response.data["questions"]), len(self.quiz_questions))
        self.assertEqual(Play.objects.count(), init_count + 1)

        # Reloading page returns the quiz again, but returns same Play:
        with self.assertNumQueries(9):
            response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            list(response.data.keys()), 
            ['name', 'introduction', 'questions']
        )
        self.assertEqual(len(response.data["questions"]), len(self.quiz_questions))
        self.assertEqual(Play.objects.count(), init_count + 1)

        # Bob is quiz author, he cannot play it:
        self.login_as("bob")
        with self.assertNumQueries(5):
            response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["form_errors"][0], "You cannot play your own quiz.")
        self.assertEqual(Play.objects.count(), init_count + 1)




class SubmitRoundTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_and_round_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]

        self.start_url = reverse(
            'plays:start-round', 
            kwargs={
                "community_id": self.community_id,
                "round_id": self.round["id"],
            }
        )
        self.url = reverse(
            'plays:submit-round', 
            kwargs={
                "community_id": self.community_id,
                "round_id": self.round["id"],
            }
        )
        self.payload = {
            "answers": [
                {"question_id": 1, "option_id": 4},
                {"question_id": 2, "option_id": 8},
            ]
        }
    
    def test_normal(self):
        """
        Group member can start a new round.
        The view returns serialized quiz with questions.
        """
        init_play_count = Play.objects.count()
        init_answer_count = PlayAnswer.objects.count()

        # Non-admins cannot create rounds:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, self.payload)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, self.payload)
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Play.objects.count(), init_play_count)
        self.assertEqual(PlayAnswer.objects.count(), init_answer_count)

        # Alice is a group member, she can play the round:
        self.login_as("alice")
        response = self.client.post(self.start_url, {})
        with self.assertNumQueries(14):
            response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        play = Play.objects.get(pk=1)
        self.assertTrue(play.is_submitted)
        self.assertEqual(play.result, 2)
        self.assertIsNotNone(play.finish_time)
        self.assertEqual(PlayAnswer.objects.count(), init_answer_count + 2)

    def test_empty_payload_raises_400(self):
        """
        List of "answers" must be in the payload.
        """
        self.login_as("alice")

        # submit without starting a round raises 404:
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # start round
        self.client.post(self.start_url, {})

        # empty payload raises 400:
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["form_errors"]["answers"][0]), 
            'This field is required.'
        )

    def test_multiple_options_for_one_question(self):
        """
        When multiple options are submitted for a single question - 
        the last one wins. Make sure on the frontend that only one 
        option is submitted.
        """
        self.login_as("alice")
        self.client.post(self.start_url, {})
        response = self.client.post(self.url, {
            "answers": [
                {"question_id": 1, "option_id": 4},
                {"question_id": 1, "option_id": 1},
                {"question_id": 1, "option_id": 2},
                {"question_id": 1, "option_id": 3}, # this one wins
                {"question_id": 2, "option_id": 8},
            ]
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        play = Play.objects.get(pk=1)
        self.assertEqual(play.result, 1)

    def test_incomplete_answers(self):
        """
        Submitting only one question works normally.
        For non-submitted questions PlayAnswer with option_id = None is created.
        """
        self.login_as("alice")
        self.client.post(self.start_url, {})
        response = self.client.post(self.url, {
            "answers": [
                {"question_id": 2, "option_id": 8},
            ]
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        play = Play.objects.get(pk=1)
        self.assertEqual(play.result, 1)
        self.assertEqual(PlayAnswer.objects.count(), 2)

    def test_re_submit_raises_400(self):
        """
        Once submitted, play cannot be modified.
        """
        self.login_as("alice")
        self.client.post(self.start_url, {})

        # initial submit
        response = self.client.post(self.url, {
            "answers": [
                {"question_id": 2, "option_id": 8},
            ]
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        play = Play.objects.get(pk=1)
        finish_time = play.finish_time
        selected_option_one = PlayAnswer.objects.get(pk=1)
        selected_option_two = PlayAnswer.objects.get(pk=2)
        
        self.assertEqual(play.result, 1)
        self.assertTrue(play.is_submitted)
        self.assertEqual(PlayAnswer.objects.count(), 2)

        # duplicate submit
        response = self.client.post(self.url, {
            "answers": [
                {"question_id": 1, "option_id": 4},
            ]
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["form_errors"][0], "You have already played this round.")
        
        play = Play.objects.get(pk=1)
        self.assertEqual(play.result, 1)
        self.assertEqual(finish_time, play.finish_time)
        self.assertEqual(selected_option_one.option_id, PlayAnswer.objects.get(pk=1).option_id)
        self.assertEqual(selected_option_two.option_id, PlayAnswer.objects.get(pk=2).option_id)
        self.assertTrue(play.is_submitted)
        self.assertEqual(PlayAnswer.objects.count(), 2)




class ReviewRoundTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_and_round_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]

        self.start_url = reverse(
            'plays:start-round', 
            kwargs={
                "community_id": self.community_id,
                "round_id": self.round["id"],
            }
        )
        self.submit_url = reverse(
            'plays:submit-round', 
            kwargs={
                "community_id": self.community_id,
                "round_id": self.round["id"],
            }
        )
        self.payload = {
            "answers": [
                {"question_id": 1, "option_id": 4}, # right
                {"question_id": 2, "option_id": 7}, # wrong
            ]
        }
        self.url = reverse(
            'plays:review-round', 
            kwargs={
                "community_id": self.community_id,
                "round_id": self.round["id"],
            }
        )
    
    def test_normal(self):
        """
        Group member can review a round after he played it.
        """
        # Check permissions:
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        self.login_as("alice")
        with self.assertNumQueries(8):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # start round
        response = self.client.post(self.start_url, {})

        with self.assertNumQueries(8):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["form_errors"][0], "You have not finished this round yet.")
        
        # submit round
        response = self.client.post(self.submit_url, self.payload)

        with self.assertNumQueries(11):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            list(response.data.keys()),
            ['play','play_answers','quiz','author','play_count','choices_by_question_id']
        )
        self.assertListEqual(
            list(response.data["play"].keys()),
            ['round','result','start_time','finish_time',
             'client_start_time','client_finish_time']
        )

    def test_author_can_review_round(self):
        """
        Quiz author can review a round at any time.
        """
        self.login_as("bob")
        with self.assertNumQueries(9):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            list(response.data.keys()),
            ['play','play_answers','quiz','author','play_count','choices_by_question_id']
        )
        self.assertDictEqual(response.data["play"], {})
        self.assertListEqual(response.data["play_answers"], [])