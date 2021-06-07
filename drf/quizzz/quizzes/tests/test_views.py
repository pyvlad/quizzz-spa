from copy import deepcopy
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from quizzz.common import test_utils

from ..models import Quiz, Question, Option
from .setup_mixin import SetupQuizDataMixin, SetupCommunityDataMixin


class CreateQuizTest(SetupCommunityDataMixin, APITestCase):
    
    def setUp(self):
        self.set_up_community_data()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'quizzes:quiz-list-create', 
            kwargs={"community_id": self.community_id}
        )

    def test_normal(self):
        """
        A registered user can create a new quiz.
        The view returns serialized new quiz without any nested objects.
        """
        # Anonymous users cannot create quizzes:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authenticated(self, response)

        # Non-members cannot create quizzes:
        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Quiz.objects.count(), 0)

        # A regular registered group member can create a new quiz:
        self.login_as("bob")
        with self.assertNumQueries(16):  
            # (1-2) request.user (3) membership (4,16) transaction (5) insert quiz (6-15) questions & options
            response = self.client.post(self.url, {})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertListEqual(
            list(response.data.keys()), 
            ['id', 'name', 'description', 'is_finalized', 'time_created', 'time_updated', 'user']
        )
        self.assertEqual(response.data["name"], "Anonymous Quiz")
        self.assertEqual(Quiz.objects.count(), 1)



class QuizListTest(SetupQuizDataMixin, APITestCase):
    def setUp(self):
        self.set_up_quiz_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'quizzes:quiz-list-create', 
            kwargs={"community_id": self.community_id}
        )

    def test_normal(self):
        """
        A group member can see his list of quizzes in a selected group.
        """
        # Anonymous user cannot see quiz list:
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # Non-members cannot see quiz list:
        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # Alice does not have any quizzes:
        self.login_as("alice")
        with self.assertNumQueries(4):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

        # Bob has one quiz:
        self.login_as("bob")
        with self.assertNumQueries(4):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertListEqual(
            list(response.data[0].keys()), 
            ['id', 'name', 'description', 'is_finalized', 'time_created', 'time_updated', 'user']
        )

        # quizzes are filtered by community, in group 2 bob get an empty list:
        self.bob_joins_group2()
        response = self.client.get(
            reverse(
                'quizzes:quiz-list-create', 
                kwargs={"community_id": 2}
            )
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)



class QuizDetailTest(SetupQuizDataMixin, APITestCase):
    
    def setUp(self):
        self.set_up_quiz_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'quizzes:quiz-detail', 
            kwargs={"community_id": self.community_id, "quiz_id": self.quiz["id"]}
        )
        self.data = {
            "name": self.quiz["name"],
            "description": self.quiz["description"],
            "introduction": self.quiz["introduction"],
            "is_finalized": self.quiz["is_finalized"],
            "questions": [
                {
                    'id': q["id"],
                    'text': q["text"],
                    'explanation': q["explanation"],
                    'options': [
                        {
                            "id": opt["id"],
                            "text": opt["text"],
                            "is_correct": opt.get("is_correct", False),
                        }
                        for opt in self.quiz_options_by_question_id[q["id"]]
                    ],
                } for q in self.quiz_questions.values()
            ]
        }


    def _test_permissions(
            self, method, body=None, 
            non_auth_queries=0, non_member_queries=3, non_owner_queries=6
        ):
        """
        Helper method to check that non-authenticated, non-members, and non-owners 
        cannot access quiz instances using any allowed method.
        """
        # Anonymous user cannot see the quiz:
        self.logout()
        with self.assertNumQueries(non_auth_queries):
            response = getattr(self.client, method)(self.url, body)
        test_utils.assert_403_not_authenticated(self, response)

        # Non-member cannot see the quiz:
        self.login_as("ben")
        with self.assertNumQueries(non_member_queries):
            response = getattr(self.client, method)(self.url, body)
        test_utils.assert_403_not_authorized(self, response)

        # Non-owner cannot see the quiz:
        self.login_as("alice")
        with self.assertNumQueries(non_owner_queries):
            response = getattr(self.client, method)(self.url, body)
        test_utils.assert_403_not_authorized(self, response)


    def test_get_quiz(self):
        """
        Quiz author can view the quiz.
        The view returns serialized new quiz without any nested objects.
        """
        self._test_permissions("get")

        # Owner can see the quiz:
        self.login_as("bob")
        with self.assertNumQueries(6): 
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # response body is expected:
        self.assertListEqual(
            list(response.data.keys()), 
            ['name', 'description', 'introduction', 'is_finalized', 'questions']
        )
        self.assertEqual(len(response.data["questions"]), len(self.quiz_questions))

        question1 = response.data["questions"][0]
        self.assertEqual(
            list(question1.keys()), 
            ['id', 'text', 'explanation', 'options']
        )
        self.assertEqual(
            len(question1["options"]), 
            len(self.quiz_options_by_question_id[question1["id"]])
        )
        self.assertEqual(
            list(question1["options"][0].keys()), 
            ['id', 'text', 'is_correct']
        )


    def test_put_quiz(self):
        """
        Quiz author can update the quiz.
        The view returns serialized new quiz without any nested objects.
        """
        self._test_permissions("put", self.data)

        # Owner can update the quiz:
        self.login_as("bob")
        with self.assertNumQueries(19):
            response = self.client.put(self.url, self.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Fields "is_finalized", "name", "questions" are required:
        with self.assertNumQueries(6):
            response = self.client.put(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["data"]["questions"][0]), "This field is required.")
        self.assertEqual(str(response.data["data"]["is_finalized"][0]), "This field is required.")
        self.assertEqual(str(response.data["data"]["name"][0]), "This field is required.")

        # Not expected fields are simply ignored:
        bad_data = self.data.copy()
        bad_data.update({ "id": 2, "user": 2, "user_id": 2, "community": 2, "community_id": 2, "abra": "kadabra"})
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Quiz.objects.count(), 1)
        quiz = Quiz.objects.get(pk=1)
        self.assertEqual(quiz.id, 1)
        self.assertEqual(quiz.user_id, 1)
        self.assertEqual(quiz.community_id, 1)

        # Messing with question IDs causes errors:
        # a. no questions submitted (or incomplete set):
        bad_data = deepcopy(self.data)
        bad_data["questions"] = []
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]), 
            "This quiz has other question ids."
        )
        # b. questions with same id submitted => wrong set of options:
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["id"] = self.data["questions"][1]["id"]
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["non_field_errors"][0]), 
            "This question has other option ids."
        )
        # c. question with a bad id is not validated:
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["id"] = 100
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["non_field_errors"][0]), 
            "This question does not belong to this quiz."
        )
        # d. fields "id" and "options" are required
        bad_data = deepcopy(self.data)
        bad_data["questions"][0].pop("options")
        bad_data["questions"][0].pop("id")
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["id"][0]), 
            "This field is required."
        )
        self.assertEqual(
            str(response.data["data"]["questions"][0]["options"][0]), 
            "This field is required."
        )

        # Messing with options causes errors:
        # a. no options submitted (incomplete set)
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["options"] = []
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["non_field_errors"][0]), 
            "This question has other option ids."
        )
        # b. question with a bad option id is not validated:
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["options"][0]["id"] = 5
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["non_field_errors"][0]), 
            "This question has other option ids."
        )
        # c. multiple correct options not allowed:
        bad_data = deepcopy(self.data)
        for opt in bad_data["questions"][0]["options"]:
            opt["is_correct"] = True
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["non_field_errors"][0]), 
            "Multiple answers not allowed."
        )

        # Extra requirements when finalizing quiz:
        # a. must have one correct answer per question:
        bad_data = deepcopy(self.data)
        bad_data["is_finalized"] = True
        for opt in bad_data["questions"][0]["options"]:
            opt["is_correct"] = False
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["non_field_errors"][0]), 
            "No correct answer selected."
        )

        # b. empty question text not allowed
        bad_data = deepcopy(self.data)
        bad_data["is_finalized"] = True
        bad_data["questions"][0]["text"] = ""
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["text"][0]), 
            "This field is required."
        )

        # c. empty option text not allowed
        bad_data = deepcopy(self.data)
        bad_data["is_finalized"] = True
        bad_data["questions"][0]["options"][0]["text"] = ""
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["data"]["questions"][0]["options"][0]["text"][0]), 
            "This field is required."
        )

    def test_update_finalized_quiz(self):
        """
        Finalized quiz cannot be updated.
        """
        quiz = Quiz.objects.get(pk=1)
        quiz.is_finalized = True
        quiz.save()
        
        self.login_as("bob")
        with self.assertNumQueries(6):
            response = self.client.put(self.url, self.data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["data"][0]), "Submitted quiz cannot be updated.")


    def test_delete_quiz(self):
        """
        Quiz author can delete the quiz.
        """
        self._test_permissions("delete", non_owner_queries=4)
        self.assertEqual(Quiz.objects.count(), 1)
        self.assertEqual(Question.objects.count(), len(self.quiz_questions))
        self.assertEqual(Option.objects.count(), len(self.quiz_options))

        # Owner can delete the quiz:
        self.login_as("bob")
        with self.assertNumQueries(9):
            # (4) select quiz (5) select quiz questions (6-9) del quiz, questions, options, rounds
            response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Quiz.objects.count(), 0)
        self.assertEqual(Question.objects.count(), 0)
        self.assertEqual(Option.objects.count(), 0)

    def test_delete_finalized_quiz(self):
        """
        Finalized quiz cannot be deleted.
        """
        quiz = Quiz.objects.get(pk=1)
        quiz.is_finalized = True
        quiz.save()
        
        self.login_as("bob")
        with self.assertNumQueries(4):
            response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(str(response.data["data"][0]), "Submitted quiz cannot be deleted.")