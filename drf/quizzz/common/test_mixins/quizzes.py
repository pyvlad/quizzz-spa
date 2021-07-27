import copy

from quizzz.quizzes.models import Quiz, Question, Option

from .data import QUIZZES
from . import SetupCommunityDataMixin


class SetupQuizDataMixin(SetupCommunityDataMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()
        cls.set_up_quiz_data()

    @classmethod
    def set_up_quiz_data(cls):
        for quasi_quiz in QUIZZES.values():
            quiz = copy.deepcopy(quasi_quiz)

            question_data = quiz.pop("question_data")
            orm_quiz = Quiz.objects.create(**quiz)
            cls.update_pk_sequence(Quiz)

            for question in question_data:
                option_data = question.pop("option_data")
                question_obj = Question.objects.create(**question, quiz_id=orm_quiz.id)
                cls.update_pk_sequence(Question)

                for option in option_data:
                    Option.objects.create(**option, question_id=question_obj.id)
                    cls.update_pk_sequence(Option)

        cls.QUIZZES = QUIZZES