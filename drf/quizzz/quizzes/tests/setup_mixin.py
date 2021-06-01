import collections
from quizzz.communities.tests.setup_mixin import SetupCommunityDataMixin
from quizzz.communities.models import Membership

from ..models import Quiz, Question, Option
from .data import QUIZZES, QUIZ_QUESTIONS, QUESTION_OPTIONS


class SetupQuizDataMixin(SetupCommunityDataMixin):
    def set_up_quiz_data(self):
        self.set_up_community_data()

        Quiz.objects.create(**QUIZZES["quiz1"])

        for question in QUIZ_QUESTIONS.values():
            Question.objects.create(**question)
            
        for option in QUESTION_OPTIONS:
            Option.objects.create(**option)

        self.quiz = QUIZZES["quiz1"]
        self.quiz_questions = QUIZ_QUESTIONS
        self.quiz_options = QUESTION_OPTIONS
        self.quiz_options_by_question_id = collections.defaultdict(list)
        for option in QUESTION_OPTIONS:
            self.quiz_options_by_question_id[option["question_id"]] += [option]