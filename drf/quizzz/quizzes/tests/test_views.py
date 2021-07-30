from copy import deepcopy
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from quizzz.common.test_mixins import SetupCommunityDataMixin, SetupQuizDataMixin

from ..models import Quiz, Question, Option


QUIZ_EXPECTED_KEYS = [
    'id', 'name', 'description', 'is_finalized', 
    'time_created', 'time_updated', 'user'
]


class CreateQuizTest(SetupCommunityDataMixin, APITestCase):
    
    def setUp(self):
        self.url = reverse(
            'quizzes:quiz-list-create', 
            kwargs={"community_id": self.GROUP_ID}
        )
        self.expected_keys = QUIZ_EXPECTED_KEYS

    def test_normal(self):
        """
        A registered user can create a new quiz.
        The view returns serialized new quiz without any nested objects.
        """
        get_response = lambda: self.client.post(self.url, {})

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        self.assertEqual(Quiz.objects.count(), 0)

        # A regular registered group member can create a new quiz:
        self.login_as("alice")
        with self.assertNumQueries(16):  
            # (1-2) request.user (3) membership (4,16) transaction (5) insert quiz (6-15) questions & options
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["name"], "Anonymous Quiz")

        self.assertEqual(Quiz.objects.count(), 1)



class QuizListTest(SetupQuizDataMixin, APITestCase):
    
    def setUp(self):
        self.url = reverse(
            'quizzes:quiz-list-create', 
            kwargs={"community_id": self.GROUP_ID}
        )
        self.expected_keys = QUIZ_EXPECTED_KEYS

    def test_normal(self):
        """
        A group member can see his list of quizzes in a selected group.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        # Alice does not have any quizzes:
        self.login_as("alice")
        with self.assertNumQueries(4):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data, [])

        # Bob has one quiz:
        self.login_as("bob")
        with self.assertNumQueries(4):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 1)
            self.assertListEqual(list(response.data[0].keys()), self.expected_keys)

        # quizzes are filtered by community, in group2 bob gets an empty list:
        self.bob_joins_group2()
        url = reverse('quizzes:quiz-list-create', kwargs={"community_id": 2})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)



class QuizDetailTest(SetupQuizDataMixin, APITestCase):
    
    def setUp(self):
        quasi_quiz = self.QUIZZES["quiz1"]
        quiz = Quiz.objects.get(pk=quasi_quiz["id"])
        questions = {q.id: q for q in quiz.questions.all()}
        options_by_question_id = {q.id: list(q.options.all()) for q in questions.values()}
        
        self.options_by_question_id = options_by_question_id
        self.num_questions = len(questions)
        self.num_options = sum(len(options) for options in options_by_question_id.values())

        self.url = reverse(
            'quizzes:quiz-detail', 
            kwargs={"community_id": self.GROUP_ID, "quiz_id": quiz.id}
        )
        self.data = {
            "name": quiz.name,
            "description": quiz.description,
            "introduction": quiz.introduction,
            "is_finalized": quiz.is_finalized,
            "questions": [
                {
                    'id': q.id,
                    'text': q.text,
                    'explanation': q.explanation,
                    'options': [
                        {
                            "id": opt.id,
                            "text": opt.text,
                            "is_correct": opt.is_correct,
                        }
                        for opt in options_by_question_id[q.id]
                    ],
                } for q in questions.values()
            ]
        }
        self.expected_keys = ['name', 'description', 'introduction', 'is_finalized', 'questions']
        self.question_expected_keys = ['id', 'text', 'explanation', 'options']
        self.option_expected_keys = ['id', 'text', 'is_correct']

    def _test_permissions(
            self, method, body=None, 
            non_member_queries=3, non_owner_queries=6
        ):
        """
        Helper method to check that non-authenticated, non-members, and non-owners 
        cannot access quiz instances using any allowed method.
        """
        get_response = lambda: getattr(self.client, method)(self.url, body)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response, non_member_queries)

        # Non-owner cannot see the quiz:
        self.login_as("alice")
        with self.assertNumQueries(non_owner_queries):
            self.assert_not_authorized(get_response())


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
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(len(response.data["questions"]), self.num_questions)

            question1 = response.data["questions"][0]
            self.assertListEqual(list(question1.keys()), self.question_expected_keys)
            
            self.assertEqual(len(question1["options"]), len(self.options_by_question_id[question1["id"]]))
            self.assertListEqual(list(question1["options"][0].keys()), self.option_expected_keys)


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
            self.assert_validation_failed(response, data={
                "questions": ["This field is required."],
                "is_finalized": ["This field is required."],
                "name": ["This field is required."]
            })

        # Not expected fields are simply ignored:
        init_quiz = Quiz.objects.get(pk=1)
        init_quiz_data = {
            'id': init_quiz.id,
            'user_id': init_quiz.user_id,
            'community_id': init_quiz.community_id,
        }

        bad_data = self.data.copy()
        bad_data.update({ "id": 2, "user": 2, "user_id": 2, "community": 2, "community_id": 2, "abra": "kadabra"})
        response = self.client.put(self.url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(Quiz.objects.count(), 1)
        quiz = Quiz.objects.get(pk=1)
        self.assertEqual(quiz.id, init_quiz_data["id"])
        self.assertEqual(quiz.user_id, init_quiz_data["user_id"])
        self.assertEqual(quiz.community_id, init_quiz_data["community_id"])

        # Messing with question IDs causes errors:
        # a. no questions submitted (or incomplete set):
        bad_data = deepcopy(self.data)
        bad_data["questions"] = []
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": ["This quiz has other question ids."] 
        })
        # b. questions with same id submitted => wrong set of options:
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["id"] = self.data["questions"][1]["id"]
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"non_field_errors": ["This question has other option ids."]}, {}],
        })
        # c. question with a bad id is not validated:
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["id"] = 100
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"non_field_errors": ["This question does not belong to this quiz."]}, {}],
        })
        # d. fields "id" and "options" are required
        bad_data = deepcopy(self.data)
        bad_data["questions"][0].pop("options")
        bad_data["questions"][0].pop("id")
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [
                {
                    "id": ["This field is required."], 
                    "options": ["This field is required."]
                }, 
                {}
            ],
        })

        # Messing with options causes errors:
        # a. no options submitted (incomplete set)
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["options"] = []
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"non_field_errors": ["This question has other option ids."]}, {}],
        })
        # b. question with a bad option id is not validated:
        bad_data = deepcopy(self.data)
        bad_data["questions"][0]["options"][0]["id"] = 5
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"non_field_errors": ["This question has other option ids."]}, {}],
        })
        # c. multiple correct options not allowed:
        bad_data = deepcopy(self.data)
        for opt in bad_data["questions"][0]["options"]:
            opt["is_correct"] = True
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"non_field_errors": ["Multiple answers not allowed."]}, {}],
        })

        # Extra requirements when finalizing quiz:
        # a. must have one correct answer per question:
        bad_data = deepcopy(self.data)
        bad_data["is_finalized"] = True
        for opt in bad_data["questions"][0]["options"]:
            opt["is_correct"] = False
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"non_field_errors": ["No correct answer selected."]}, {}],
        })

        # b. empty question text not allowed
        bad_data = deepcopy(self.data)
        bad_data["is_finalized"] = True
        bad_data["questions"][0]["text"] = ""
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [{"text": ["This field is required."]}, {}],
        })

        # c. empty option text not allowed
        bad_data = deepcopy(self.data)
        bad_data["is_finalized"] = True
        bad_data["questions"][0]["options"][0]["text"] = ""
        response = self.client.put(self.url, bad_data)
        self.assert_validation_failed(response, data={
            "questions": [
                { "options": [{"text": ["This field is required."]},{},{},{}] }, 
                {}
            ],
        })

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
            self.assert_validation_failed(response, ["Submitted quiz cannot be updated."])


    def test_delete_quiz(self):
        """
        Quiz author can delete the quiz.
        """
        self._test_permissions("delete", non_owner_queries=4)

        self.assertEqual(Quiz.objects.count(), 1)
        self.assertEqual(Question.objects.count(), self.num_questions)
        self.assertEqual(Option.objects.count(), self.num_options)

        # Owner can delete the quiz:
        self.login_as("bob")
        with self.assertNumQueries(12):
            # (4) select quiz (5) select quiz questions (6) select options (7) select round
            # (8-12) del quiz, questions, options, answers[2]
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
            self.assert_validation_failed(response, ["Submitted quiz cannot be deleted."])