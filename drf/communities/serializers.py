from rest_framework import serializers

from .models import Community, Membership


class JoinCommunitySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(allow_blank=True, max_length=20, default="")


class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            'name',
            'password',
            'approval_required',
            'max_members',
            'time_created',
        ]
        read_only_fields = ['time_created']
    
    def create(self, validated_data):
        """
        Create a new community and become an admin there.
        Requires 'user' to be injected when calling '.save()'.
        """
        user = validated_data.pop("user")
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
        read_only_fields = ['user', 'time_created']

    def create(self, validated_data):
        """
        Create a new regular community membership.
        Requires 'user' and 'community' objects to be injected when calling '.save()'.
        """
        user = validated_data.pop('user')
        community = validated_data.pop('community')
        membership = community.join(user)
        return membership