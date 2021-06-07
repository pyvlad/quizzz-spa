from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Tournament, Round
from quizzz.quizzes.serializers import ListedQuizSerializer


class TournamentSerializer(serializers.ModelSerializer):
    """
    CRUD serializer for tournaments.
    """
    class Meta:
        model = Tournament
        fields = [
            'id',
            'name',
            'is_active',
            'community',
        ]
        read_only_fields=["id", "community"]

    def create(self, validated_data):
        """
        Requires 'community_id' to be injected when calling '.save()'.
        """
        assert "community_id" in validated_data
        return Tournament.objects.create(**validated_data)



class ListedRoundSerializer(serializers.ModelSerializer):
    """
    Serializer to view existing rounds with nested quiz information.
    """
    quiz = ListedQuizSerializer()

    class Meta:
        model = Round
        fields = [
            'id',
            'start_time',
            'finish_time',
            'tournament',
            'quiz',
        ]


class EditableRoundSerializer(serializers.ModelSerializer):
    """
    Serializer to create / update existing round.
    """
    class Meta:
        model = Round
        fields = [
            'id',
            'start_time',
            'finish_time',
            'tournament',
            'quiz',
        ]
        read_only_fields = ["id", "tournament"]

    def create(self, validated_data):
        """
        Requires 'tournament_id' to be injected when calling '.save()'.
        """
        assert "tournament_id" in validated_data
        return Round.objects.create(**validated_data)