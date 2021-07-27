import collections
from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import QUIZZES, QUIZ_QUESTIONS, QUESTION_OPTIONS
from quizzz.communities.tests.setup_mixin import SetupCommunityDataMixin

from ..models import Quiz, Question, Option


class SetupQuizDataMixin(SetupCommunityDataMixin):
    def set_up_quiz_data(self):
        self.set_up_community_data()

        Quiz.objects.create(**QUIZZES["quiz1"])
        update_pk_sequence(Quiz)

        for question in QUIZ_QUESTIONS.values():
            Question.objects.create(**question)
        update_pk_sequence(Question)
            
        for option in QUESTION_OPTIONS:
            Option.objects.create(**option)
        update_pk_sequence(Option)

        self.quiz = QUIZZES["quiz1"]
        self.quiz_questions = QUIZ_QUESTIONS
        self.quiz_options = QUESTION_OPTIONS
        self.quiz_options_by_question_id = collections.defaultdict(list)
        for option in QUESTION_OPTIONS:
            self.quiz_options_by_question_id[option["question_id"]] += [option]