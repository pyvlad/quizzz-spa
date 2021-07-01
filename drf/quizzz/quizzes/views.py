from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .serializers import EditableQuizSerializer, ListedQuizSerializer
from .models import Quiz

from quizzz.common.permissions import IsOwner, IsAuthenticated
from quizzz.communities.permissions import IsCommunityMember

from django.contrib.auth import get_user_model
User = get_user_model()

NUM_QUESTIONS = 2
NUM_OPTIONS = 4


class QuizListOrCreate(APIView):
    """
    Create a new quiz or list user's quizzes.
    """
    permission_classes = [ IsAuthenticated, IsCommunityMember ]

    def get(self, request, community_id):
        quizzes = Quiz.objects\
            .filter(user=request.user)\
            .filter(community_id=community_id)\
            .all()
        serializer = ListedQuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def post(self, request, community_id):
        quiz = Quiz.create_with_questions(
            user=request.user,
            community_id=community_id,
            num_questions=NUM_QUESTIONS,
            num_options=NUM_OPTIONS,
        )
        serializer = ListedQuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class QuizDetail(APIView):
    """
    Read, update, delete an existing quiz.
    """
    permission_classes = [
        IsAuthenticated,
        IsCommunityMember & IsOwner,
    ]

    def get_object(self, quiz_id, prefetch=True):
        q = Quiz.objects.filter(pk=quiz_id)
        if prefetch:
            q = q.prefetch_related('questions').prefetch_related('questions__options')
        obj = get_object_or_404(q)
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, community_id, quiz_id):
        quiz = self.get_object(quiz_id)
        serializer = EditableQuizSerializer(quiz)
        return Response(serializer.data)

    def put(self, request, community_id, quiz_id):
        quiz = self.get_object(quiz_id)
        if quiz.is_finalized:
            raise ValidationError("Submitted quiz cannot be updated.")
        serializer = EditableQuizSerializer(quiz, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

    def delete(self, request, community_id, quiz_id):
        quiz = self.get_object(quiz_id, prefetch=False)
        if quiz.is_finalized:
            raise ValidationError("Submitted quiz cannot be deleted.")
        quiz.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)