from rest_framework import serializers

from .models import ChatMessage
from users.serializers import UserSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    # user = UserSerializer(read_only=True) 
    # nested serializers are read-only by default
    # setting read-only here just to be sure

    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'text',
            'time_created',
            'time_updated',
            # foreign keys:
            'user', 
            'community',
        ]
        read_only_fields = ['id', 'time_created', 'time_updated', 'user', 'community']