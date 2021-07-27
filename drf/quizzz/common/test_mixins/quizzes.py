import collections

from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import QUIZZES, QUIZ_QUESTIONS, QUESTION_OPTIONS

from quizzz.quizzes.models import Quiz, Question, Option

from . import SetupCommunityDataMixin


class SetupQuizDataMixin(SetupCommunityDataMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()
        cls.set_up_quiz_data()

    @classmethod
    def set_up_quiz_data(cls):
        Quiz.objects.create(**QUIZZES["quiz1"])
        update_pk_sequence(Quiz)

        for question in QUIZ_QUESTIONS.values():
            Question.objects.create(**question)
        update_pk_sequence(Question)
            
        for option in QUESTION_OPTIONS:
            Option.objects.create(**option)
        update_pk_sequence(Option)

        cls.quiz = QUIZZES["quiz1"]
        cls.quiz_questions = QUIZ_QUESTIONS
        cls.quiz_options = QUESTION_OPTIONS
        cls.quiz_options_by_question_id = collections.defaultdict(list)
        for option in QUESTION_OPTIONS:
            cls.quiz_options_by_question_id[option["question_id"]] += [option]