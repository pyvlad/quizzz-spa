from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions
from rest_framework.pagination import PageNumberPagination

from .models import ChatMessage
from .serializers import ChatMessageSerializer
from communities.permissions import IsCommunityMember, IsCommunityAdmin


class ChatPagination(PageNumberPagination):
    page_size = settings.QUIZZZ_CHAT_PAGE_SIZE


class ChatMessageList(generics.ListCreateAPIView):
    """
    List all chat messages, or create a new chat message.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsCommunityMember,
    ]
    pagination_class = ChatPagination

    def get_queryset(self):
        """
        Overriding this method since we need to provide different
        querysets depending on the incoming request.
        """
        return (
            ChatMessage.objects
            .filter(community_id=self.kwargs['community_id'])
            .order_by('time_created')
        )

    def perform_create(self, serializer):
        """
        This method allows us to modify how the instance save is managed.
        Associate the user and the community with the created message.
        """
        serializer.save(user=self.request.user, community_id=self.kwargs['community_id'])


# Non-generic version of the code above (without pagination):

# class ChatMessageList(APIView):
#     """
#     List all chat messages, or create a new chat message.
#     """
#     permission_classes = [
#         permissions.IsAuthenticated,
#         IsCommunityMember,
#     ]

#     def get(self, request):
#         messages = ChatMessage.objects.filter(community_id=self.kwargs['community_id'])
#         serializer = ChatMessageSerializer(messages, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = ChatMessageSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             serializer.save(
#                 user=self.request.user, 
#                 group=self.kwargs['community_id']
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatMessageDetail(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
        IsCommunityAdmin,
    ]

    def delete(self, request, community_id, message_id):
        message = get_object_or_404(ChatMessage.objects.filter(pk=message_id))
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
