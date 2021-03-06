from django.conf import settings
from rest_framework import serializers

from .models import Tournament, Round
from quizzz.quizzes.models import Quiz
from quizzz.users.serializers import UserSerializer


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
            'time_created',
        ]
        read_only_fields=["id", "community", 'time_created']

    def create(self, validated_data):
        """
        Requires 'community_id' to be injected when calling '.save()'.
        """
        assert "community_id" in validated_data
        return Tournament.objects.create(**validated_data)



class ListedQuizSerializer(serializers.ModelSerializer):
    """
    Serializer to create new empty quiz (with questions) 
    or show existing ones in a list.
    """
    user = UserSerializer()
    class Meta:
        model = Quiz
        fields = [
            'id',
            'name',
            'description',
            'is_finalized',
            'time_created',
            'time_updated',
            'user',
        ]
        read_only_fields = ['id', 'is_finalized', 'time_created', 'time_updated', 'user']


class ListedRoundSerializer(serializers.ModelSerializer):
    """
    Serializer to view existing rounds with nested quiz information.
    """
    quiz = ListedQuizSerializer()
    status = serializers.CharField(source='get_status', read_only=True)

    class Meta:
        model = Round
        fields = [
            'id',
            'start_time',
            'finish_time',
            'tournament',
            'quiz',
            'status',
            'user_play_id',    # id
            'user_play_is_submitted', # bool
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['is_author'] = instance.is_authored_by(self.context["request"].user.id)
        return ret


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

    def check_selected_quiz(self, quiz, tournament_id):
        # ensure_quiz_belongs_to_the_group:
        group_id_of_tournament = Tournament.objects.get(pk=tournament_id).community_id
        if group_id_of_tournament != quiz.community_id:
            raise serializers.ValidationError({"quiz": ["Quiz does not belong to this group."]})
        # ensure quiz is finalized:
        if not quiz.is_finalized:
            raise serializers.ValidationError({"quiz": ["Quiz has not been submitted yet."]})

    def enforce_rounds_per_tournament_limit(self, tournament_id):
        num_rounds = Round.objects.filter(tournament_id=tournament_id).count()
        if num_rounds >= settings.QUIZZZ_ROUNDS_PER_TOURNAMENT_LIMIT:
            raise serializers.ValidationError("Too many rounds. Please start a new tournament.")


    def create(self, validated_data):
        """
        Requires 'tournament_id' to be injected when calling '.save()'.
        """
        assert "tournament_id" in validated_data

        self.enforce_rounds_per_tournament_limit(validated_data["tournament_id"])
        self.check_selected_quiz(validated_data["quiz"], validated_data["tournament_id"])
        
        return Round.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Requires 'tournament_id' to be injected when calling '.save()'.
        """
        assert "tournament_id" in validated_data

        self.check_selected_quiz(validated_data["quiz"], validated_data["tournament_id"])

        instance.start_time = validated_data.get("start_time")
        instance.finish_time = validated_data.get("finish_time")
        instance.quiz = validated_data.get("quiz")
        instance.save()

        return instance