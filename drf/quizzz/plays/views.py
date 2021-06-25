from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

from quizzz.communities.permissions import IsCommunityMember

from quizzz.tournaments.models import Round
from quizzz.quizzes.models import Quiz
from .models import Play, PlayAnswer
from .serializers import SubmittedPlaySerializer, PlayQuizSerializer, ReviewPlaySerializer



class StartRound(APIView):
    """
    Create a new play or return a non-finished one.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        IsCommunityMember,
    ]

    def post(self, request, community_id, round_id):
        # round information and checks:
        round = get_object_or_404(Round.objects.filter(pk=round_id))
        if not round.is_active:
            return Response(
                "This round is not available (already finished or not started yet).",
                status.HTTP_400_BAD_REQUEST
            )
        if round.is_authored_by(request.user.id):
            return Response(
                "You cannot play your own quiz.",
                status.HTTP_400_BAD_REQUEST
            )

        # start a new play or continue (page reload)
        (play, created) = Play.objects.get_or_create(
            user_id=request.user.id, round_id=round_id)
        if play.is_submitted:
            return Response(
                "You have already played this round.", 
                status.HTTP_400_BAD_REQUEST
            )
        
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
    permission_classes = [
        permissions.IsAuthenticated,
        IsCommunityMember,
    ]

    def post(self, request, community_id, round_id):
        # load round information and run checks:
        round = get_object_or_404(Round.objects.filter(pk=round_id))
        if not round.is_active:
            return Response(
                "This round is not available (already finished or not started yet).",
                status.HTTP_400_BAD_REQUEST
            )

        # load a play and run checks:
        play = get_object_or_404(
            Play.objects.filter(user_id=request.user.id, round_id=round_id)
        )
        if play.is_submitted:
            return Response(
                "You have already played this round.", 
                status.HTTP_400_BAD_REQUEST
            )

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
    permission_classes = [
        permissions.IsAuthenticated,
        IsCommunityMember,
    ]

    def get(self, request, community_id, round_id):
        # load a play and run checks:
        play = get_object_or_404(
            Play.objects.filter(user_id=request.user.id, round_id=round_id)
        )
        if not play.is_submitted:
            return Response(
                "You have not finished this round yet.", 
                status.HTTP_403_FORBIDDEN
            )

        # load round information and run checks:
        round = get_object_or_404(Round.objects.filter(pk=round_id))

        # load quiz with questions
        quiz = get_object_or_404(
            Quiz.objects.filter(pk=round.quiz_id)
            .prefetch_related('questions')
            .prefetch_related('questions__options')
        )

        # return data
        serializer = ReviewPlaySerializer(play)
        return Response(serializer.data)