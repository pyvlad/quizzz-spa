from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from quizzz.common.test_mixins import SetupCommunityDataMixin, SetupTournamentsMixin

from ..models import Tournament


TOURNAMENT_EXPECTED_KEYS = ['id', 'name', 'is_active', 'community', 'time_created']


class CreateTournamentTest(SetupCommunityDataMixin, APITestCase):
    def setUp(self):
        self.url = reverse(
            'tournaments:tournament-list-create', 
            kwargs={"community_id": self.GROUP_ID}
        )
        self.payload = {"name": "First"}
        self.expected_keys = TOURNAMENT_EXPECTED_KEYS

    def test_normal(self):
        """
        Group admin can create a new tournament.
        The view returns serialized new tournament.
        """
        get_response = lambda: self.client.post(self.url, self.payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        self.assertEqual(Tournament.objects.count(), 0)

        # Group admin can create a new tournament:
        self.login_as("bob")
        with self.assertNumQueries(4):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)

        self.assertEqual(Tournament.objects.count(), 1)



class TournamentListTest(SetupTournamentsMixin, APITestCase):
    def setUp(self):
        self.url = reverse(
            'tournaments:tournament-list-create', 
            kwargs={"community_id": self.GROUP_ID}
        )
        self.expected_keys = TOURNAMENT_EXPECTED_KEYS

    def test_normal(self):
        """
        A group member can see list of tournaments in the group.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response, 4)

        # a regular group members can see group tournaments
        self.login_as("alice")
        with self.assertNumQueries(4):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 1)
            self.assertListEqual(list(response.data[0].keys()), self.expected_keys)



class TournamentDetailTest(SetupTournamentsMixin, APITestCase):
    def setUp(self):
        self.TOURNAMENT = "tournament1"
        self.TOURNAMENT_ID = self.TOURNAMENTS[self.TOURNAMENT]["id"]
        self.TOURNAMENT_NAME = self.TOURNAMENTS[self.TOURNAMENT]["name"]

        self.url = reverse(
            'tournaments:tournament-detail',  
            kwargs={
                'community_id': self.GROUP_ID,
                'tournament_id': self.TOURNAMENT_ID,
            }
        )
        self.update_payload = self.TOURNAMENTS[self.TOURNAMENT].copy()
        self.update_payload["name"] = "New"
        self.update_payload["is_active"] = False
        self.expected_keys = TOURNAMENT_EXPECTED_KEYS

    def test_get_tournament(self):
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response, 4)

        # a regular group member sees the data
        self.login_as("alice")
        with self.assertNumQueries(4):  # (3) member check (4) get data
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["name"], self.TOURNAMENT_NAME)


    def test_update_tournament_works_for_group_admins(self):
        get_response = lambda: self.client.put(self.url, self.update_payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        tournament = Tournament.objects.get(pk=1)
        self.assertNotEqual(tournament.name, self.update_payload["name"])
        self.assertNotEqual(tournament.is_active, self.update_payload["is_active"])

        # group admin can update the data:
        self.login_as("bob")
        with self.assertNumQueries(5):
            # (3) is admin check (4) select obj (5) update  
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
        
        tournament = Tournament.objects.get(pk=1)
        self.assertEqual(tournament.name, self.update_payload["name"])
        self.assertEqual(tournament.is_active, self.update_payload["is_active"])


    def test_delete_community_works_for_group_admins(self):
        get_response = lambda: self.client.delete(self.url)
        
        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        self.assertEqual(Tournament.objects.filter(pk=1).count(), 1)

        # bob is group admin, he can delete the tournament:
        self.login_as("bob")
        with self.assertNumQueries(6):
            # (4) select tournament (5) del rounds (6) del tournament
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(response.data, None)

        self.assertEqual(Tournament.objects.filter(pk=1).count(), 0)