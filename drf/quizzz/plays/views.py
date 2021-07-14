from collections import defaultdict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from django.shortcuts import get_object_or_404

from quizzz.common.permissions import IsAuthenticated
from quizzz.communities.permissions import IsCommunityMember
from quizzz.tournaments.models import Round
from quizzz.quizzes.models import Quiz
from .models import Play, PlayAnswer
from .serializers import (
    SubmittedPlaySerializer, 
    PlayQuizSerializer, 
    ReviewPlaySerializer,
    ReviewQuizSerializer,
    SubmittedAnswerSerializer,
)
from quizzz.communities.serializers import UserForMembershipListSerializer




class StartRound(APIView):
    """
    Create a new play or return a non-finished one.
    """
    permission_classes = [ IsAuthenticated, IsCommunityMember ]

    def post(self, request, community_id, round_id):
        # round information and checks:
        round = get_object_or_404(Round.objects.filter(pk=round_id))
        if not round.is_active:
            raise serializers.ValidationError(
                "This round is not available (already finished or not started yet)."
            )
        if round.is_authored_by(request.user.id):
            raise serializers.ValidationError("You cannot play your own quiz.")

        # start a new play or continue (page reload)
        (play, created) = Play.objects.get_or_create(
            user_id=request.user.id, round_id=round_id)
        if play.is_submitted:
            raise serializers.ValidationError("You have already played this round.")
        
        # load quiz with questions
        q = Quiz.objects\
            .filter(pk=round.quiz_id)\
            .prefetch_related('questions')\
            .prefetch_related('questions__options')
        quiz = get_object_or_404(q)

        serializer = PlayQuizSerializer(quiz)
        return Response(serializer.data)



class SubmitRound(APIView):
    """
    Submit a play with selected answers.
    """
    permission_classes = [IsAuthenticated, IsCommunityMember]

    def post(self, request, community_id, round_id):
        # load round information and run checks:
        round = get_object_or_404(Round.objects.filter(pk=round_id))
        if not round.is_active:
            raise serializers.ValidationError(
                "This round is not available (already finished or not started yet)."
            )

        # load a play and run checks:
        play = get_object_or_404(
            Play.objects.filter(user_id=request.user.id, round_id=round_id)
        )
        if play.is_submitted:
            raise serializers.ValidationError("You have already played this round.")

        # load quiz with questions
        quiz = get_object_or_404(
            Quiz.objects.filter(pk=round.quiz_id)
            .prefetch_related('questions')
            .prefetch_related('questions__options')
        )

        # validate data and save results
        serializer = SubmittedPlaySerializer(play, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(play=play, quiz=quiz)
            return Response(serializer.data)


class ReviewRound(APIView):
    """
    Review round with selected answers.
    """
    permission_classes = [ IsAuthenticated, IsCommunityMember ]

    def get(self, request, community_id, round_id):
        # load round information and run checks:
        round = get_object_or_404(Round.objects.filter(pk=round_id))

        # load quiz with questions and author
        quiz = get_object_or_404(
            Quiz.objects.filter(pk=round.quiz_id)
            .select_related('user')
            .prefetch_related('questions')
            .prefetch_related('questions__options')
        )

        # load a play and run checks (author has no play - but that's fine)
        play = None if quiz.user_id == request.user.id else get_object_or_404(
            Play.objects.filter(user_id=request.user.id, round_id=round_id))
        if play and not play.is_submitted:
            raise serializers.ValidationError("You have not finished this round yet.")

        # load user answers:
        play_answers = play.answers.all() if play else []

        # load play count:
        play_count = Play.objects.filter(round__id=round_id).count()
        
        # load all choice stats:
        all_answers = PlayAnswer.objects.filter(play__round__id=round_id).all()
        choices_by_question_id = { q.id: defaultdict(int) for q in quiz.questions.all() }
        for answer in all_answers:
            choices_by_question_id[answer.question_id][answer.option_id] += 1

        # return data
        play_serializer = ReviewPlaySerializer(play)
        play_answers_serializer = SubmittedAnswerSerializer(play_answers, many=True)
        quiz_serializer = ReviewQuizSerializer(quiz)
        author_serializer = UserForMembershipListSerializer(quiz.user)

        return Response({
            "play": play_serializer.data,
            "play_answers": play_answers_serializer.data,
            "quiz": quiz_serializer.data,
            "author": author_serializer.data,
            "play_count": play_count,
            "choices_by_question_id": choices_by_question_id,   # counts for all plays
        })