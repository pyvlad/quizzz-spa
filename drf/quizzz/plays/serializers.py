from rest_framework import serializers
from django.utils import timezone
from django.db import transaction

from .models import Play, PlayAnswer
from quizzz.quizzes.models import Quiz, Question, Option
from quizzz.communities.serializers import UserForMembershipListSerializer


# ************
# Quiz to play
# ************
class PlayOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = [
            'id',
            'text',
        ]
        read_only_fields = ["id", "text"]

class PlayQuestionSerializer(serializers.ModelSerializer):
    options = PlayOptionSerializer(many=True)
    class Meta: 
        model = Question
        fields = [
            'id',
            'text',
            'options',
        ]
        read_only_fields = ["id", "text", "options"]

class PlayQuizSerializer(serializers.ModelSerializer):
    """
    Top-level serializer to play a quiz (with nested questions and question options).
    """
    questions = PlayQuestionSerializer(many=True)
    class Meta: 
        model = Quiz
        fields = [
            'name',
            'introduction',
            'questions',
        ]
        read_only_fields = ["name", "introduction", "questions"]



# **************
# Submitted Quiz
# **************
class SubmittedAnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField()
    option_id = serializers.IntegerField()
    class Meta:
        model = PlayAnswer
        fields = [
            'question_id',
            'option_id',
        ]

class SubmittedPlaySerializer(serializers.ModelSerializer):
    """
    CRUD serializer for plays.
    """
    answers = SubmittedAnswerSerializer(many=True)

    class Meta:
        model = Play
        fields = [
            'client_start_time',
            'client_finish_time',
            'answers',
        ]

    def update(self, instance, validated_data):
        """
        Update and return an existing `Play` instance, given the validated data.

        Requires 'play' and 'quiz' instances to be injected into 'validated_data'.
        """
        play = validated_data['play']
        quiz = validated_data['quiz']

        submitted_answers = {
            answer.get("question_id"): answer.get("option_id")
            for answer in validated_data["answers"]
        }

        new_answer_objects = []
        num_correct = 0
        for question in quiz.questions.all():

            available_options_by_id = {option.id: option for option in question.options.all()}          
            
            submitted_option_id = submitted_answers.get(question.id)
            if submitted_option_id is not None and submitted_option_id not in available_options_by_id:
                raise serializers.ValidationError("Option ids do not match.")

            new_answer_objects += [
                PlayAnswer(
                    play=play, 
                    question_id=question.id, 
                    option_id=submitted_option_id
                )
            ]
            
            selected_option = available_options_by_id.get(submitted_option_id)
            num_correct += (selected_option is not None and selected_option.is_correct)

        instance.is_submitted = True
        instance.finish_time = timezone.now()
        instance.result = num_correct

        # save changes:
        with transaction.atomic():
            for object in new_answer_objects:
                object.save()
            instance.save()
            
        return instance



# ***********
# Quiz Review
# ***********
class ReviewOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = [
            'id',
            'text',
            'is_correct',
        ]
        read_only_fields = ["id", "text", "is_correct"]

class ReviewQuestionSerializer(serializers.ModelSerializer):
    options = PlayOptionSerializer(many=True)
    class Meta: 
        model = Question
        fields = [
            'id',
            'text',
            'options',
        ]
        read_only_fields = ["id", "text", "options"]

class ReviewQuizSerializer(serializers.ModelSerializer):
    """
    Top-level serializer to play a quiz (with nested questions and question options).
    """
    questions = PlayQuestionSerializer(many=True)
    class Meta: 
        model = Quiz
        fields = [
            'name',
            'introduction',
            'questions',
            'user',
        ]
        read_only_fields = ["name", "description", "introduction", "questions"]

class ReviewPlaySerializer(serializers.ModelSerializer):
    """
    CRUD serializer for plays.
    """
    answers = SubmittedAnswerSerializer(many=True)
    quiz = ReviewQuizSerializer(source='round.quiz')
    author = UserForMembershipListSerializer(source='round.quiz.user')

    class Meta:
        model = Play
        fields = [
            'round',
            'result',
            'start_time',
            'finish_time',
            'client_start_time',
            'client_finish_time',
            'answers',
            'quiz',
            'author',
        ]
        read_only_fields=[
            'user', 'round', 'result', 'start_time', 'finish_time',
            'client_start_time', 'client_finish_time', 'answers', 'quiz',
        ]