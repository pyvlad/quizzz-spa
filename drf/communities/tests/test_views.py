# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase

from .setup_mixin import SetupCommunityDataMixin

from users.models import CustomUser
from communities.models import Community, Membership
from common import test_utils



class CommunityListTest(SetupCommunityDataMixin, APITestCase):

    def setUp(self):
        self.set_up_community_data()
        self.url = reverse('communities:community-list')

    def test_normal(self):
        """
        Only superuser sees all existing communities.
        """
        # anonymous users cannot access
        with self.assertNumQueries(0):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # regular users cannot access
        self.login_as("bob")
        with self.assertNumQueries(2):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

        # superuser can access
        self.login_as("admin")
        with self.assertNumQueries(3):
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(self.communities))
        self.assertListEqual(
            list(response.data[0].keys()), 
            ["id", "name", "password", "approval_required", "max_members", "time_created"]
        )



class UserCommunitiesTest(SetupCommunityDataMixin, APITestCase):
    
    def setUp(self):
        self.set_up_community_data()
        # bob's community list:
        self.url = reverse(
            'communities:user-communities',  
            kwargs={'user_id': self.user_by_name["bob"]["id"]}
        )

    def test_normal(self):
        """
        Only the user himself can see his own list of communities.
        """
        # Anonymous users cannot see someone's list of communities:
        with self.assertNumQueries(0):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # Regular users cannot see someone's list of communities:
        self.login_as("alice")
        with self.assertNumQueries(2):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

        # User can see his list of communities:
        self.login_as("bob")
        with self.assertNumQueries(3):
            response = self.client.get(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bob = CustomUser.objects.get(username="bob")
        self.assertEqual(len(response.data), len(bob.communities.all()))



class CreateCommunityTest(SetupCommunityDataMixin, APITestCase):
    
    def setUp(self):
        self.set_up_community_data()
        self.url = reverse('communities:create-community')
        self.new_community = {"name": "Group 4"}

    def test_normal(self):
        """
        A registered user can create a new community.
        The view returns the user's new membership.
        """
        # Anonymous users cannot create communities:
        with self.assertNumQueries(0):
            response = self.client.post(self.url, self.new_community, format="json")
        test_utils.assert_403_not_authenticated(self, response)
        self.assertEqual(Community.objects.count(), len(self.communities))

        # A regular registered user can create communities:
        self.login_as("bob")
        with self.assertNumQueries(5):  # (1-2) request.user (3) unique check (4-5) com & mem
            response = self.client.post(
                self.url, 
                self.new_community, 
                format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertListEqual(
            list(response.data.keys()), 
            ['user', 'community', 'is_admin', 'is_approved', 'time_created']
        )
        self.assertListEqual(
            list(response.data["community"].keys()), 
            ["id", "name", "password", "approval_required", "max_members", "time_created"]
        )
        self.assertEqual(Community.objects.count(), len(self.communities) + 1)

    def test_community_already_exists(self):
        """
        Community name must be unique.
        """
        new_community = {"name": self.communities[0]["name"]}

        self.login_as("bob")
        
        with self.assertNumQueries(3):
            response = self.client.post(
                self.url, 
                new_community, 
                format="json"
            )

        test_utils.assert_400_validation_failed(self, response,
            error="Bad data submitted.", 
            data={"name": ["community with this name already exists."]}
        )
        self.assertEqual(Community.objects.count(), len(self.communities))



class JoinCommunityTest(SetupCommunityDataMixin, APITransactionTestCase):
    # Using TransactionTestCase here because in "test_member_already_exists"
    # IntegrityError is raised - TestCase wraps all code in a transaction, and 
    # cannot proceed when a DB query fails: 
    # "An error occurred in the current transaction.
    # You can't execute queries until the end of the 'atomic' block."
    def setUp(self):
        self.set_up_community_data()
        self.url = reverse('communities:join-community')
        self.join_data = {
            "name": "A", 
            "password": self.community_by_name["A"]["password"]
        }

    def test_authentication_required(self):
        """
        Anonymous users cannot join communities.
        """
        with self.assertNumQueries(0):
            response = self.client.post(self.url, self.join_data, format="json")
        test_utils.assert_403_not_authenticated(self, response)
        self.assertEqual(Community.objects.count(), len(self.communities))
    
    def test_normal(self):
        """
        A registered user can join an existing community.
        The view returns the user's new membership.
        """
        USER = "alice"
        self.login_as(USER)

        with self.assertNumQueries(5): # (3) get com (4) member count (5) insert
            response = self.client.post(
                self.url, 
                self.join_data, 
                format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            list(response.data.keys()), 
            ['user', 'community', 'is_admin', 'is_approved', 'time_created']
        )
        self.assertListEqual(
            list(response.data["community"].keys()), 
            ["id", "name", "password", "approval_required", "max_members", "time_created"]
        )
        self.assertEqual(response.data["user"], self.user_by_name[USER]["id"])
        self.assertEqual(response.data["is_admin"], False)
        self.assertEqual(response.data["community"]["name"], self.join_data["name"])
        self.assertEqual(Membership.objects.count(), len(self.communities) + 1)

    def test_max_members(self):
        """ 
        Can only join a group if max_members limit has not been reached.
        """
        Community.objects\
            .filter(pk=self.community_by_name["A"]["id"])\
            .update(max_members=1)
        
        self.login_as("alice")

        with self.assertNumQueries(4):
            response = self.client.post(
                self.url, 
                self.join_data, 
                format="json"
            )
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.", 
            data={"non_field_errors": ["This group has reached its member limit."]}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))

    def test_member_already_exists(self):
        """ 
        Can only join a group once.
        """
        self.login_as("bob")

        with self.assertNumQueries(5):
            response = self.client.post(
                self.url, 
                self.join_data, 
                format="json"
            )
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.", 
            data={"non_field_errors": ["You are already a member of this group."]}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))

    def test_wrong_password(self):
        """
        Submitting wrong password returns an error.
        """
        self.login_as("alice")

        bad_credentials = self.join_data.copy()
        bad_credentials["password"] = "wrooooong"

        with self.assertNumQueries(3):
            response = self.client.post(
                self.url, 
                bad_credentials, 
                format="json"
            )
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.", 
            data={"non_field_errors": ["Wrong password."]}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))

    def test_wrong_group_name(self):
        """
        Submitting wrong password returns an error.
        """
        self.login_as("alice")

        bad_credentials = self.join_data.copy()
        bad_credentials["name"] = "does not exist"

        with self.assertNumQueries(3):
            response = self.client.post(
                self.url, 
                bad_credentials, 
                format="json"
            )
        test_utils.assert_400_validation_failed(self, response,
            error="Bad data submitted.", 
            data={"non_field_errors": ["No such group."]}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))



def alice_joins_the_community():
    """ Reusable helper method """
    community = Community.objects.get(name="A")
    alice = CustomUser.objects.get(username="alice")
    community.join(alice)



class MembershipListTest(SetupCommunityDataMixin, APITestCase):
    
    def setUp(self):
        self.set_up_community_data()
        self.url = reverse(
            'communities:community-members',  
            kwargs={'community_id': self.community_by_name["A"]["id"]}
        )

    def test_authentication_required(self):
        """
        Anonymous users cannot see any community's members.
        """
        with self.assertNumQueries(0):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

    def test_non_members_cannot_see(self):
        """
        Registered user who are non-members of the community cannot see its members.
        """
        self.login_as("ben")
        with self.assertNumQueries(3):  # (3) is member check 
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

    def test_normal(self):
        """
        Community members can view all its members.
        """
        alice_joins_the_community()

        # bob is group admin:
        self.login_as("bob")
        with self.assertNumQueries(4):  # (3) is member check (4) member list join on users
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # alice has just joined as a regular member:
        self.login_as("alice")
        with self.assertNumQueries(4):
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)



class CommunityDetailTest(SetupCommunityDataMixin, APITestCase):
    def setUp(self):
        self.set_up_community_data()
        self.url = reverse(
            'communities:community-detail',  
            kwargs={'community_id': self.community_by_name["A"]["id"]}
        )
        self.new_data = self.community_by_name["A"].copy()
        self.new_data["password"] = "new-password"
        self.expected_keys = [
            "id", "name", "password", "approval_required", "max_members", "time_created"
        ]

    def test_get_community(self):
        alice_joins_the_community()

        # anonymous users have no access:
        with self.assertNumQueries(0):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # bob is group admin, he sees the data:
        self.login_as("bob")

        with self.assertNumQueries(4):  # (3) member check (4) get data
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["name"], "A")

        # alice is group member, she sees the data:
        self.login_as("alice")

        with self.assertNumQueries(4):  # (3) member check (4) get data
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["name"], "A")

        # ben is not a group member, he sees nothing:
        self.login_as("ben")

        with self.assertNumQueries(4): # (3) member check (4) get data
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

    def test_update_community_works_for_group_admins(self):
        # bob is group admin, he can update the data:
        self.login_as("bob")

        with self.assertNumQueries(6):  
            # (3) is admin check (4) select obj (5) new obj unique check (6) update  
            response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["password"], self.new_data["password"])
        self.assertEqual(Community.objects.get(name="A").password, self.new_data["password"])

    def test_update_community_name_to_an_existing_one_fails(self):
        self.login_as("bob")

        new_data = self.community_by_name["A"].copy()
        new_data["name"] = "B"

        with self.assertNumQueries(5):
            response = self.client.put(self.url, new_data, format="json")
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.", 
            data={"name": ["community with this name already exists."]}
        )
        self.assertEqual(Community.objects.filter(name="B").count(), 1)

    def test_update_community_for_non_admins_should_fail(self):
        alice_joins_the_community()

        # anonymous users have no access:
        with self.assertNumQueries(0):
            response = self.client.put(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # alice is now regular group member, she cannot update the data:
        self.login_as("alice")

        with self.assertNumQueries(3):  # (3) is admin check
            response = self.client.put(self.url, self.new_data, format="json")
        test_utils.assert_403_not_authorized(self, response)

        # ben is not a group member at all, he cannot update the data either:
        self.login_as("ben")

        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data, format="json")
        test_utils.assert_403_not_authorized(self, response)

        self.assertNotEqual(Community.objects.get(name="A").password, self.new_data["password"])


    def test_delete_community_works_for_group_admins(self):
        # bob is group admin, he can delete the group:
        self.login_as("bob")

        with self.assertNumQueries(6): # (5) del members (6) del com
            response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Community.objects.filter(name="A").count(), 0)

    def test_delete_community_for_non_admins_should_fail(self):
        alice_joins_the_community()

        # anonymous users have no access
        with self.assertNumQueries(0):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # alice is now regular group member, she cannot update the data:
        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

        # ben is not a group member at all, he cannot update the data either:
        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Community.objects.filter(name="A").count(), 1)



class MembershipDetailTest(SetupCommunityDataMixin, APITestCase):
    def setUp(self):
        self.set_up_community_data()
        self.COMMUNITY = self.community_by_name["A"]["id"]
        self.USER = self.user_by_name["bob"]["id"]
        self.url = reverse(
            'communities:membership-detail',  
            kwargs={
                'community_id': self.COMMUNITY,
                'user_id': self.USER,
            }
        )
        # let's try making bob not an admin:
        self.new_data = {"is_admin": False}
        self.expected_keys = [
            'user', 'community', 'is_admin', 'is_approved', 'time_created'
        ]

    def test_get_membership(self):
        alice_joins_the_community()

        # anonymous users have no access:
        with self.assertNumQueries(0):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # bob is group admin and it's his data, he sees the data:
        self.login_as("bob")
        with self.assertNumQueries(5):  # (3) check membership (4) get mem (5) get com (?)
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["user"], self.USER)

        # alice is group member, she sees the data:
        self.login_as("alice")
        with self.assertNumQueries(5):
            response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), self.expected_keys)
        self.assertEqual(response.data["user"], self.USER)

        # ben is not a group member, he sees nothing:
        self.login_as("ben")
        with self.assertNumQueries(4):
            response = self.client.get(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)


    def test_update_membership_works_for_group_admins(self):
        # bob is group admin, he can update the data:
        self.login_as("bob")

        with self.assertNumQueries(6): # (3) is admin check (4) get mem (5) update mem (6) get com (?)
            response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ['user', 'community', 'is_admin', 'is_approved', 'time_created']
        )
        self.assertEqual(response.data["is_admin"], False)
        self.assertFalse(Membership.objects.get(
            community_id=self.COMMUNITY, user_id=self.USER).is_admin)

    def test_submit_bad_data_when_updating_membership(self):
        """
        Modified read-only fields are ignored.
        Trying to update with invalid values results in an error.
        """
        self.login_as("bob")

        # let's try to change bob's membership to ben
        new_data = {"user": self.user_by_name["ben"]["id"]}
        with self.assertNumQueries(6): # as normal
            response = self.client.put(self.url, new_data, format="json")

        # user name is a read-only field so it is simply ignored:
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"], self.user_by_name["bob"]["id"])

        # now, let's try to submit bad value:
        new_data = {"is_admin": "Of course!"}
        with self.assertNumQueries(4):
            response = self.client.put(self.url, new_data, format="json")

        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.", 
            data={"is_admin": ["Must be a valid boolean."]}
        )
        self.assertTrue(Membership.objects.get(
            user__username="bob", community_id=self.COMMUNITY).is_admin)


    def test_update_community_for_non_admins_should_fail(self):
        alice_joins_the_community()

        # anonymous users have no access:
        with self.assertNumQueries(0):
            response = self.client.put(self.url, self.new_data, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # alice is a regular group member, she cannot update the data:
        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data, format="json")
        test_utils.assert_403_not_authorized(self, response)

        # ben is not a group member at all, he cannot update the data either:
        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.put(self.url, self.new_data, format="json")
        test_utils.assert_403_not_authorized(self, response)
        self.assertTrue(Membership.objects.get(
            community_id=self.COMMUNITY, user_id=self.USER).is_admin)


    def test_delete_membership_works_for_group_admins(self):
        alice_joins_the_community()
        ALICE_ID = 2

        url = reverse(
            'communities:membership-detail',  
            kwargs={
                'community_id': self.COMMUNITY,
                'user_id': ALICE_ID,
            }
        )
        # bob is group admin, he can delete alice:
        self.login_as("bob")

        with self.assertNumQueries(5):
            response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=ALICE_ID).count(), 0)

        # but he cannot delete himself because he is an admin:
        with self.assertNumQueries(3):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)
        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=self.USER).count(), 1)


    def test_users_can_leave_a_group(self):
        alice_joins_the_community()
        ALICE_ID = 2

        url = reverse(
            'communities:membership-detail',  
            kwargs={
                'community_id': self.COMMUNITY,
                'user_id': ALICE_ID,
            }
        )
        # alice can leave the community:
        self.login_as("alice")
        with self.assertNumQueries(5):
            response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)

        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=ALICE_ID).count(), 0)


    def test_delete_membership_for_non_admins_should_fail(self):
        alice_joins_the_community()

        # anonymous users have no access
        with self.assertNumQueries(0):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authenticated(self, response)

        # alice is a regular community member, she cannot delete a member:
        self.login_as("alice")
        with self.assertNumQueries(3):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

        # ben is not a group member at all, he cannot delete the data either:
        self.login_as("ben")
        with self.assertNumQueries(3):
            response = self.client.delete(self.url, format="json")
        test_utils.assert_403_not_authorized(self, response)

        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=self.USER).count(), 1)


