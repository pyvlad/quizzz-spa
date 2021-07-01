from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics

from quizzz.communities.permissions import IsCommunityMember, IsCommunityAdmin
from quizzz.common.permissions import IsSafeMethod, IsAuthenticated

from .models import Tournament, Round
from .serializers import (
    TournamentSerializer, 
    ListedRoundSerializer,
    ListedQuizSerializer, 
    EditableRoundSerializer,
)
from quizzz.quizzes.models import Quiz


class TournamentListOrCreate(APIView):
    """
    Create a new tournament or list group's tournaments.
    """
    permission_classes = [
        IsAuthenticated,
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
        IsAuthenticated,
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
        IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]

    def get(self, request, community_id, tournament_id):
        
        rounds = Round.objects\
            .filter(tournament_id=tournament_id)\
            .prefetch_related(Round.get_user_plays_prefetch_object(request.user.id))\
            .all()
        serializer = ListedRoundSerializer(rounds, many=True, context={'request': request})

        return Response(serializer.data)

    def post(self, request, community_id, tournament_id):
        serializer = EditableRoundSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            round_obj = serializer.save(tournament_id=tournament_id)

            round_obj.load_user_plays(request.user.id)
            detailed_serializer = ListedRoundSerializer(round_obj, context={'request': request})
            
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)



class RoundDetail(generics.RetrieveDestroyAPIView):
    """
    Retrieve/update/delete existing round.
    """
    permission_classes = [
        IsAuthenticated,
        (IsSafeMethod & IsCommunityMember) | IsCommunityAdmin,
    ]
    queryset = Round.objects.all()
    lookup_url_kwarg = "round_id"

    def get_serializer_class(self):
        if self.request.method == 'DELETE':
            return EditableRoundSerializer

    def get(self, request, community_id, round_id):
        obj = get_object_or_404(Round.objects.filter(pk=round_id))
        self.check_object_permissions(self.request, obj)

        obj.load_user_plays(request.user.id)
        serializer = ListedRoundSerializer(obj, context={'request': request})

        return Response({
            "round": serializer.data,
            "standings": obj.get_standings(),
        })

    def put(self, request, community_id, round_id):
        obj = get_object_or_404(Round.objects.filter(pk=round_id))
        self.check_object_permissions(self.request, obj)

        serializer = EditableRoundSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            round_obj = serializer.save(tournament_id=obj.tournament_id)

            round_obj.load_user_plays(request.user.id)
            detailed_serializer = ListedRoundSerializer(round_obj, context={'request': request})
            
            return Response(detailed_serializer.data)



class QuizPool(APIView):
    """
    List group's available quizzes.
    """
    permission_classes = [ IsAuthenticated, IsCommunityAdmin ]

    def get(self, request, community_id):
        quizzes = Quiz.objects\
            .filter(community_id=community_id)\
            .filter(is_finalized=True)\
            .filter(round__id=None)\
            .order_by('-time_created')\
            .all()
        serializer = ListedQuizSerializer(quizzes, many=True)
        return Response(serializer.data)


class TournamentStandings(APIView):
    permission_classes = [ IsAuthenticated,  IsCommunityMember ]
    
    def get(self, request, community_id, tournament_id):
        tournament = get_object_or_404(Tournament.objects.filter(pk=tournament_id))
        standings = tournament.get_standings()
        return Response(standings)