from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics

from quizzz.communities.permissions import IsCommunityMember, IsCommunityAdmin
from quizzz.common.permissions import IsSafeMethod

from .models import Tournament, Round
from .serializers import TournamentSerializer, ListedRoundSerializer, EditableRoundSerializer



class TournamentListOrCreate(APIView):
    """
    Create a new tournament or list group's tournaments.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]

    def get(self, request, community_id):
        tournaments = Tournament.objects.filter(community_id=community_id).all()
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request, community_id):
        serializer = TournamentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(community_id=community_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)



class TournamentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve/update/delete existing tournament.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]
    queryset = Tournament.objects.all()
    lookup_url_kwarg = "tournament_id"
    serializer_class = TournamentSerializer



class RoundListOrCreate(APIView):
    """
    Create a new round or list tournament rounds.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]

    def get(self, request, community_id, tournament_id):
        rounds = Round.objects.filter(tournament_id=tournament_id).all()
        serializer = ListedRoundSerializer(rounds, many=True)
        return Response(serializer.data)

    def post(self, request, community_id, tournament_id):
        serializer = EditableRoundSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(tournament_id=tournament_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)



class RoundDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve/update/delete existing round.
    """
    permission_classes = [
        permissions.IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]
    queryset = Round.objects.all()
    lookup_url_kwarg = "round_id"

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListedRoundSerializer
        return EditableRoundSerializer
