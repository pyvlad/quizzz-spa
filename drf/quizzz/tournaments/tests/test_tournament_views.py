from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from quizzz.common import test_utils
from quizzz.common.test_mixins import SetupCommunityDataMixin, SetupTournamentDataMixin

from ..models import Tournament



class CreateTournamentTest(SetupCommunityDataMixin, APITestCase):
    def setUp(self):
        self.set_up_community_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'tournaments:tournament-list-create', 
            kwargs={"community_id": self.community_id}
        )

    def test_normal(self):
        """
        Group admin can create a new tournament.
        The view returns serialized new tournament.
        """
        # Anonymous users cannot create tournaments:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authenticated(self, response)

        # Non-members cannot create tournaments:
        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authorized(self, response)

        # Regular group members cannot create tournaments:
        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, {})
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Tournament.objects.count(), 0)

        # Group admin can create a new tournament:
        self.login_as("bob")
        with self.assertNumQueries(4):
            response = self.client.post(self.url, {"name": "First"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertListEqual(
            list(response.data.keys()), 
            ['id', 'name', 'is_active', 'community', 'time_created']
        )

        self.assertEqual(Tournament.objects.count(), 1)



class TournamentListTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'tournaments:tournament-list-create', 
            kwargs={"community_id": self.community_id}
        )

    def test_normal(self):
        """
        A group member can see list of tournaments in the group.
        """
        # Anonymous user cannot see tournament list:
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # Non-members cannot see tournament list:
        self.login_as("ben")
        with self.assertNumQueries(4):  # TODO 2 membership queries
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # Members see group tournaments:
        self.login_as("alice")
        with self.assertNumQueries(4):
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertListEqual(
            list(response.data[0].keys()), 
            ['id', 'name', 'is_active', 'community', 'time_created'],
        )



class TournamentDetailTest(SetupTournamentDataMixin, APITestCase):
    def setUp(self):
        self.set_up_tournament_data()
        self.alice_joins_group1()

        self.community_id = self.communities["group1"]["id"]
        self.url = reverse(
            'tournaments:tournament-detail',  
            kwargs={
                'community_id': self.communities["group1"]["id"],
                'tournament_id': self.tournament["id"],
            }
        )
        self.new_data = self.tournament.copy()
        self.new_data["name"] = "New"
        self.new_data["is_active"] = False
        self.expected_keys = ["id", "name", "is_active", "community", 'time_created']

    def test_get_tournament(self):
        # anonymous users have no access:
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # ben is not a group member, he sees nothing:
        self.login_as("ben")
        with self.assertNumQueries(4):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # alice is a group member, she sees the data:
        self.login_as("alice")
        with self.assertNumQueries(4):  # (3) member check (4) get data
            response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["name"], self.tournament['name'])


    def test_update_tournament_works_for_group_admins(self):
        # non-admins have no access:
        with self.assertNumQueries(0):
            response = self.client.put(self.url, self.new_data)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data)
        test_utils.assert_403_not_authorized(self, response)

        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data)
        test_utils.assert_403_not_authorized(self, response)     

        tournament = Tournament.objects.get(pk=1)
        self.assertNotEqual(tournament.name, self.new_data["name"])
        self.assertNotEqual(tournament.is_active, self.new_data["is_active"])

        # bob is a group admin, he can update the data:
        self.login_as("bob")
        with self.assertNumQueries(5):
            # (3) is admin check (4) select obj (5) update  
            response = self.client.put(self.url, self.new_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        tournament = Tournament.objects.get(pk=1)
        self.assertEqual(tournament.name, self.new_data["name"])
        self.assertEqual(tournament.is_active, self.new_data["is_active"])


    def test_delete_community_works_for_group_admins(self):
        # non-admins have no access:
        with self.assertNumQueries(0):
            response = self.client.delete(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.put(self.url)
        test_utils.assert_403_not_authorized(self, response)

        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.put(self.url)
        test_utils.assert_403_not_authorized(self, response)     

        self.assertEqual(Tournament.objects.filter(pk=1).count(), 1)

        # bob is group admin, he can delete the tournament:
        self.login_as("bob")
        with self.assertNumQueries(6):
            # (4) select tournament (5) del rounds (6) del tournament
            response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Tournament.objects.filter(pk=1).count(), 0)