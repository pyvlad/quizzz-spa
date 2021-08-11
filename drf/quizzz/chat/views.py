from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions
from rest_framework.pagination import PageNumberPagination

from .models import ChatMessage
from .serializers import ChatMessageSerializer

from quizzz.common.permissions import IsAuthenticated
from quizzz.communities.permissions import IsCommunityMember, IsCommunityAdmin
from quizzz.tournaments.models import Round
from quizzz.plays.models import Play


class RoundPlayedOrAuthored(permissions.BasePermission):
    def has_permission(self, request, view):
        round_id = request.query_params.get('round_id', None)
        if round_id is None:
            return True

        round = get_object_or_404(Round.objects.filter(pk=round_id))
        
        quiz_author_id = round.quiz.user_id
        if request.user.id == quiz_author_id:
            return True

        play = get_object_or_404(Play.objects.filter(user_id=request.user.id, round_id=round_id))
        if play and play.is_submitted:
            return True
        
        return False


class ChatPagination(PageNumberPagination):
    page_size = settings.QUIZZZ_CHAT_PAGE_SIZE


class ChatMessageList(generics.ListCreateAPIView):
    """
    List all chat messages, or create a new chat message.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated, IsCommunityMember, RoundPlayedOrAuthored]
    pagination_class = ChatPagination

    def get_queryset(self):
        """
        Overriding this method since we need to provide different
        querysets depending on the incoming request.
        """
        queryset = (
            ChatMessage.objects
            .filter(community_id=self.kwargs['community_id'])
            .select_related('user')
            .order_by('-time_created')
        )
        round_id = self.request.query_params.get('round_id', None)
        queryset = queryset.filter(round_id=round_id)
        return queryset

    def perform_create(self, serializer):
        """
        This method allows us to modify how the instance save is managed.
        Associate the user and the community with the created message.
        """
        serializer.save(
            user=self.request.user, 
            community_id=self.kwargs['community_id'],
            round_id = self.request.query_params.get('round_id', None),
        )


# Non-generic version of the code above (without pagination):

# class ChatMessageList(APIView):
#     """
#     List all chat messages, or create a new chat message.
#     """
#     permission_classes = [
#         IsAuthenticated,
#         IsCommunityMember,
#     ]

#     def get(self, request, community_id):
#         messages = ChatMessage.objects.filter(community_id=self.kwargs['community_id'])
#         serializer = ChatMessageSerializer(messages, many=True)
#         return Response(serializer.data)

#     def post(self, request, community_id):
#         serializer = ChatMessageSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             serializer.save(
#                 user=self.request.user, 
#                 community_id=self.kwargs['community_id']
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatMessageDetail(APIView):
    permission_classes = [IsAuthenticated, IsCommunityAdmin]

    def delete(self, request, community_id, message_id):
        message = get_object_or_404(ChatMessage.objects.filter(pk=message_id))
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
