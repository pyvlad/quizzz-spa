from rest_framework import serializers
from rest_framework.settings import api_settings
from .models import Community, Membership, MemberLimitException, MemberAlreadyExistsException


class JoinCommunitySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(allow_blank=True, max_length=20, default="")
    
    # not putting these methods in .validate(data) method to skip if data is not valid
    # order of validation: https://stackoverflow.com/a/27591842
    # TODO: add .validate method but run it conditionally if field-level validators pass
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

    def create_membership(self, user, community):
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