from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from quizzz.common.test_mixins import SetupRoundsMixin
from quizzz.quizzes.tests.test_views import QUIZ_EXPECTED_KEYS

from quizzz.quizzes.models import Quiz
from ..models import Play, PlayAnswer


QUIZ_EXPECTED_KEYS = ['name', 'introduction', 'questions']
REVIEWED_ROUND_EXPECTED_KEYS = [
    'play','play_answers','quiz','author','play_count','choices_by_question_id'
]
REVIEWED_PLAY_EXPECTED_KEYS = [
    'round','result','start_time','finish_time', 'client_start_time','client_finish_time'
]


class StartRoundTest(SetupRoundsMixin, APITestCase):
    def setUp(self):
        self.ROUND = "round1"
        self.ROUND_ID = self.ROUNDS[self.ROUND]["id"]
        self.QUIZ_ID = self.ROUNDS[self.ROUND]["quiz_id"]

        quiz = Quiz.objects.get(pk=self.QUIZ_ID)
        self.num_questions = quiz.questions.count()

        self.url = reverse(
            'plays:start-round', 
            kwargs={
                "community_id": self.GROUP_ID,
                "round_id": self.ROUND_ID,
            }
        )
        self.expected_keys = QUIZ_EXPECTED_KEYS
    
    def test_normal(self):
        """
        Group member can start a new round.
        The view returns serialized quiz with questions.
        """
        init_count = Play.objects.count()

        get_response = lambda: self.client.post(self.url, {})

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        self.assertEqual(Play.objects.count(), init_count)

        # a regular group member can start the round
        self.login_as("alice")
        with self.assertNumQueries(12):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(len(response.data["questions"]), self.num_questions)

        self.assertEqual(Play.objects.count(), init_count + 1)

        # reloading page returns the quiz again, but returns same Play:
        with self.assertNumQueries(9):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(len(response.data["questions"]), self.num_questions)

        self.assertEqual(Play.objects.count(), init_count + 1)

        # Bob is quiz author, he cannot play it:
        self.login_as("bob")
        with self.assertNumQueries(5):
            response = get_response()
            self.assert_validation_failed(response, data=["You cannot play your own quiz."])

        self.assertEqual(Play.objects.count(), init_count + 1)




class SubmitRoundTest(SetupRoundsMixin, APITestCase):
    def setUp(self):
        self.ROUND = "round1"
        self.ROUND_ID = self.ROUNDS[self.ROUND]["id"]
        self.QUIZ_ID = self.ROUNDS[self.ROUND]["quiz_id"]

        self.start_url = reverse(
            'plays:start-round', 
            kwargs={
                "community_id": self.GROUP_ID,
                "round_id": self.ROUND_ID,
            }
        )
        self.url = reverse(
            'plays:submit-round', 
            kwargs={
                "community_id": self.GROUP_ID,
                "round_id": self.ROUND_ID,
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

        get_response = lambda: self.client.post(self.url, self.payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        self.assertEqual(Play.objects.count(), init_play_count)
        self.assertEqual(PlayAnswer.objects.count(), init_answer_count)

        # a regular group member can submit the round
        self.login_as("alice")
        self.client.post(self.start_url, {})    # (must start the round first)
        with self.assertNumQueries(14):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        play = Play.objects.get(user_id=self.USERS["alice"]["id"], round_id=self.ROUND_ID)
        self.assertTrue(play.is_submitted)
        self.assertEqual(play.result, 2)
        self.assertIsNotNone(play.finish_time)
        self.assertEqual(PlayAnswer.objects.count(), init_answer_count + 2)

    def test_submit_without_starting_raises_404(self):
        """
        Submit without starting a round raises 404.
        """
        self.login_as("alice")
        with self.assertNumQueries(5):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_payload_raises_400(self):
        """
        List of "answers" must be in the payload.
        """
        self.login_as("alice")
        self.client.post(self.start_url, {})
        response = self.client.post(self.url, {})
        self.assert_validation_failed(response, data={
            "answers": ["This field is required."]
        })

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
        play = Play.objects.get(user_id=self.USERS["alice"]["id"], round_id=self.ROUND_ID)
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
        play = Play.objects.get(user_id=self.USERS["alice"]["id"], round_id=self.ROUND_ID)
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
        
        play = Play.objects.get(user_id=self.USERS["alice"]["id"], round_id=self.ROUND_ID)
        finish_time = play.finish_time
        selected_option_one = PlayAnswer.objects.get(play_id=play.id, question_id=1)
        selected_option_two = PlayAnswer.objects.get(play_id=play.id, question_id=2)
        
        self.assertEqual(play.result, 1)
        self.assertTrue(play.is_submitted)
        self.assertEqual(PlayAnswer.objects.count(), 2)

        # duplicate submit
        response = self.client.post(self.url, {
            "answers": [
                {"question_id": 1, "option_id": 4},
            ]
        })
        self.assert_validation_failed(response, data=["You have already played this round."])
        
        play = Play.objects.get(user_id=self.USERS["alice"]["id"], round_id=self.ROUND_ID)
        self.assertEqual(play.result, 1)
        self.assertEqual(finish_time, play.finish_time)
        self.assertEqual(selected_option_one.option_id, PlayAnswer.objects.get(play_id=play.id, question_id=1).option_id)
        self.assertEqual(selected_option_two.option_id, PlayAnswer.objects.get(play_id=play.id, question_id=2).option_id)
        self.assertTrue(play.is_submitted)
        self.assertEqual(PlayAnswer.objects.count(), 2)




class ReviewRoundTest(SetupRoundsMixin, APITestCase):
    def setUp(self):
        self.ROUND = "round1"
        self.ROUND_ID = self.ROUNDS[self.ROUND]["id"]
        self.QUIZ_ID = self.ROUNDS[self.ROUND]["quiz_id"]

        self.url = reverse(
            'plays:review-round', 
            kwargs={
                "community_id": self.GROUP_ID,
                "round_id": self.ROUND_ID,
            }
        )
        self.start_url = reverse(
            'plays:start-round', 
            kwargs={
                "community_id": self.GROUP_ID,
                "round_id": self.ROUND_ID,
            }
        )
        self.submit_url = reverse(
            'plays:submit-round', 
            kwargs={
                "community_id": self.GROUP_ID,
                "round_id": self.ROUND_ID,
            }
        )
        self.submit_payload = {
            "answers": [
                {"question_id": 1, "option_id": 4}, # right
                {"question_id": 2, "option_id": 7}, # wrong
            ]
        }
    
    def test_normal(self):
        """
        Group member can review a round after he played it.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        self.login_as("alice")
        self.client.post(self.start_url, {}) # start round
        self.client.post(self.submit_url, self.submit_payload) # submit round

        with self.assertNumQueries(11):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), REVIEWED_ROUND_EXPECTED_KEYS)
            self.assertListEqual(list(response.data["play"].keys()), REVIEWED_PLAY_EXPECTED_KEYS)


    def test_cannot_review_non_submitted_round(self):
        get_response = lambda: self.client.get(self.url)

        self.login_as("alice")

        # try reviewing before starting:
        with self.assertNumQueries(8):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # try reviewing after starting but before submitting:
        self.client.post(self.start_url, {}) # start round
        with self.assertNumQueries(8):
            response = get_response()
            self.assert_validation_failed(response, ["You have not finished this round yet."])

    def test_author_can_review_round(self):
        """
        Quiz author can review a round at any time.
        """
        self.login_as("bob")
        with self.assertNumQueries(9):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), REVIEWED_ROUND_EXPECTED_KEYS)
            self.assertDictEqual(response.data["play"], {})
            self.assertListEqual(response.data["play_answers"], [])