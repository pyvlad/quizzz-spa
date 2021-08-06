from django.conf import settings
from rest_framework import serializers
from rest_framework.settings import api_settings

from .models import Community, Membership
from .exceptions import MemberLimitException, MemberAlreadyExistsException

from django.contrib.auth import get_user_model
User = get_user_model()


class JoinCommunitySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(allow_blank=True, max_length=20, default="")
    
    def get_community(self, data):
        try:
            community = Community.objects.get(name=data["name"])
        except Community.DoesNotExist:
            raise serializers.ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: ["No such group."]
            })
        return community

    def check_password(self, data, community):
        if community.password != data["password"]:
            raise serializers.ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: ["Wrong password."]
            })

    def enforce_joined_communities_limit(self, user):
        num_joined_communities = user.membership_set.filter(is_admin=False).count()
        if num_joined_communities >= settings.QUIZZZ_JOINED_COMMUNITIES_LIMIT:
            raise serializers.ValidationError(
                "You have reached the limit for communities joined."
            )

    def create_membership(self, user, community):
        self.enforce_joined_communities_limit(user)

        try:
            return community.join(user=user)
        except MemberLimitException:
            raise serializers.ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: ["This group has reached its member limit."]
            })
        except MemberAlreadyExistsException:
            raise serializers.ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: ["You are already a member of this group."]
            })


class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'password',
            'approval_required',
            'max_members',
            'time_created',
        ]
        read_only_fields = ['time_created']
    
    def enforce_created_communities_limit(self, user):
        num_created_communities = user.membership_set.filter(is_admin=True).count()
        if num_created_communities >= settings.QUIZZZ_CREATED_COMMUNITIES_LIMIT:
            raise serializers.ValidationError(
                "You have reached the limit for communities created."
            )

    def create(self, validated_data):
        """
        Create a new community and become an admin there.
        Requires 'user' to be injected when calling '.save()'.
        """
        user = validated_data.pop("user")
        self.enforce_created_communities_limit(user)
        return Community.create(user, **validated_data)




class MembershipSerializer(serializers.ModelSerializer):
    community = CommunitySerializer(read_only=True) 
    # nested serializers are read-only by default
    # setting read-only here just to be sure

    class Meta:
        model = Membership
        fields = [
            'user', 
            'community', 
            'is_admin', 
            'is_approved',
            'time_created',
        ]
        read_only_fields = ['user', 'community', 'time_created']



class UserForMembershipListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'last_login'
        ]


class MembershipForMemberListSerializer(serializers.ModelSerializer):
    user = UserForMembershipListSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = [
            'user',
            'community',
            'is_admin', 
            'is_approved',
            'time_created',
        ]
        read_only_fields = ['user', 'community', 'time_created']