from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status

from .serializers import MembershipSerializer, CommunitySerializer, \
    JoinCommunitySerializer, MembershipForMemberListSerializer
from .models import Membership, Community
from .permissions import IsCommunityAdmin, IsCommunityMember

from quizzz.users.permissions import IsSuperuser, AuthenticatedAsUrlUserId
from quizzz.common.permissions import IsSafeMethod, IsDeleteMethod, IsAuthenticated

from django.contrib.auth import get_user_model
User = get_user_model()



class CommunityList(APIView):
    """
    List all communities.
    """
    permission_classes = [IsAuthenticated, IsSuperuser]

    def get(self, request):
        communities = Community.objects.all()
        serializer = CommunitySerializer(communities, many=True)
        return Response(serializer.data)



class CommunityDetail(APIView):
    """
    Read, update, delete an existing community.
    """
    permission_classes = [
        IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]

    def get_object(self):
        # Object level permissions are run by REST framework's generic views 
        obj = get_object_or_404(
            Community.objects.filter(pk=self.kwargs['community_id'])
        )
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, community_id):
        community = self.get_object()
        serializer = CommunitySerializer(community)
        return Response(serializer.data)

    def put(self, request, community_id):
        community = self.get_object()
        serializer = CommunitySerializer(community, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

    def delete(self, request, community_id):
        community = self.get_object()
        community.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class UserCommunityList(APIView):
    """
    List user's communities as part of membership objects.
    """
    permission_classes = [
        IsAuthenticated,
        AuthenticatedAsUrlUserId,
    ]

    def get(self, request, user_id):
        user_id = request.user.id
        memberships = (
            Membership.objects.all()
            .filter(user__id=user_id)
            .select_related('community')
        )
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)



class CreateCommunity(APIView):
    """
    Create a new community with user_id becoming an admin there.
    """
    permission_classes = [ IsAuthenticated ]

    def post(self, request):
        serializer = CommunitySerializer(data=request.data)
        
        if serializer.is_valid(raise_exception=True):
            membership = serializer.save(user=request.user)

            # return membership and community data to user
            ms = MembershipSerializer(membership)
            return Response(ms.data, status=status.HTTP_201_CREATED)



class JoinCommunity(APIView):
    """
    Create a membership in an existing community.
    """
    permission_classes = [ IsAuthenticated ]

    def post(self, request):
        serializer = JoinCommunitySerializer(data=request.data)
        
        if serializer.is_valid(raise_exception=True):
            data = serializer.validated_data
            
            community = serializer.get_community(data)
            serializer.check_password(data, community)
            membership = serializer.create_membership(request.user, community)

            # return membership and community data to user
            ms = MembershipSerializer(membership)
            return Response(ms.data)



class MembershipList(APIView):
    """
    List all community members.
    """
    permission_classes = [ IsAuthenticated, IsCommunityMember ]

    def get(self, request, community_id):
        memberships = (
            Membership.objects.all()
            .filter(community__id=community_id)
            .select_related('user')
        )
        serializer = MembershipForMemberListSerializer(memberships, many=True)
        return Response(serializer.data)



class MembershipDetail(APIView):
    """
    Read, update, delete an existing membership.
    """
    permission_classes = [
        IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) 
        | (~(AuthenticatedAsUrlUserId & IsDeleteMethod) & IsCommunityAdmin) 
        | ((AuthenticatedAsUrlUserId & IsDeleteMethod) & (~IsCommunityAdmin))
    ]

    def get_object(self):
        obj = get_object_or_404(
            Membership.objects.filter(
                user__id=self.kwargs["user_id"],
                community__id=self.kwargs["community_id"]
            )
        ) 
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, user_id, community_id):
        membership = self.get_object()
        serializer = MembershipForMemberListSerializer(membership)
        return Response(serializer.data)

    def put(self, request, user_id, community_id):
        membership = self.get_object()
        serializer = MembershipForMemberListSerializer(membership, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

    def delete(self, request, user_id, community_id):
        membership = self.get_object()
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)