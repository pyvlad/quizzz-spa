# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase

from .setup_mixin import SetupCommunityDataMixin

from users.models import CustomUser
from communities.models import Community, Membership


class CommunityListTest(SetupCommunityDataMixin, APITestCase):

    def setUp(self):
        self.set_up_community_data()
        self.url = reverse('communities:community-list')

    def test_normal(self):
        """
        Superuser sees all existing communities.
        """
        # anonymous users cannot access
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # regular users cannot access
        self.login_as("bob")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # superuser can access
        self.login_as("admin")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(self.communities))
        self.assertListEqual(
            list(response.data[0].keys()), 
            ["name", "password", "approval_required", "max_members", "time_created"]
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
        User can see his list of communities.
        """
        self.login_as("bob")

        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        bob = CustomUser.objects.get(username="bob")
        self.assertEqual(len(response.data), len(bob.communities.all()))

    def test_authentication_required(self):
        """
        Anonymous users cannot see someone's list of communities.
        """
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")
        
    def test_other_users_cannot_access(self):
        """
        Only the user himself can see his own list of communities.
        """
        self.login_as("alice")

        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")



class CreateCommunityTest(SetupCommunityDataMixin, APITestCase):
    
    def setUp(self):
        self.set_up_community_data()
        self.url = reverse('communities:create-community')
        self.new_community = {"name": "Group 4"}

    def test_authentication_required(self):
        """
        Anonymous users cannot create communities.
        """
        response = self.client.post(self.url, self.new_community, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")
        self.assertEqual(Community.objects.count(), len(self.communities))

    def test_normal(self):
        """
        A registered user can create a new community.
        The view returns the user's new membership.
        """
        self.login_as("bob")
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
            ["name", "password", "approval_required", "max_members", "time_created"]
        )
        self.assertEqual(Community.objects.count(), len(self.communities) + 1)

    def test_community_already_exists(self):
        """
        Community name must be unique.
        """
        new_community = {"name": self.communities[0]["name"]}

        self.login_as("bob")
        response = self.client.post(
            self.url, 
            new_community, 
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertDictEqual(
            response.data, 
            {"name": ["community with this name already exists."]}
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
        response = self.client.post(self.url, self.join_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")
        self.assertEqual(Community.objects.count(), len(self.communities))
    
    def test_normal(self):
        """
        A registered user can join an existing community.
        The view returns the user's new membership.
        """
        USER = "alice"
        self.login_as(USER)

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
            ["name", "password", "approval_required", "max_members", "time_created"]
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
        response = self.client.post(
            self.url, 
            self.join_data, 
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertDictEqual(
            response.data, 
            {"userMessage": "This group has reached its member limit."}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))

    def test_member_already_exists(self):
        """ 
        Can only join a group once.
        """
        self.login_as("bob")
        response = self.client.post(
            self.url, 
            self.join_data, 
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertDictEqual(
            response.data, 
            {"userMessage": "You are already a member of this group."}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))

    def test_wrong_password(self):
        """
        Submitting wrong password returns an error.
        """
        self.login_as("alice")

        bad_credentials = self.join_data.copy()
        bad_credentials["password"] = "wrooooong"

        response = self.client.post(
            self.url, 
            bad_credentials, 
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertDictEqual(
            response.data, 
            {"userMessage": "Wrong password."}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))

    def test_wrong_group_name(self):
        """
        Submitting wrong password returns an error.
        """
        self.login_as("alice")

        bad_credentials = self.join_data.copy()
        bad_credentials["name"] = "does not exist"

        response = self.client.post(
            self.url, 
            bad_credentials, 
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertDictEqual(
            response.data, 
            {"userMessage": "No such group."}
        )
        self.assertEqual(Membership.objects.count(), len(self.communities))



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
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

    def test_non_members_cannot_see(self):
        """
        Registered user who are non-members of the community cannot see its members.
        """
        self.login_as("ben")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

    def test_normal(self):
        """
        Community members can view all its members.
        """
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # bob is group admin:
        self.login_as("bob")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # alice has just joined as a regular member:
        self.login_as("alice")
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

    def test_get_community(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # anonymous users have no access:
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

        # bob is group admin, he sees the data:
        self.login_as("bob")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ["name", "password", "approval_required", "max_members", "time_created"]
        )
        self.assertEqual(response.data["name"], "A")

        # alice is group member, she sees the data:
        self.login_as("alice")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ["name", "password", "approval_required", "max_members", "time_created"]
        )
        self.assertEqual(response.data["name"], "A")

        # ben is not a group member, he sees nothing:
        self.login_as("ben")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

    def test_update_community_works_for_group_admins(self):
        # bob is group admin, he can update the data:
        self.login_as("bob")
        response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ["name", "password", "approval_required", "max_members", "time_created"]
        )
        self.assertEqual(response.data["password"], self.new_data["password"])
        self.assertEqual(Community.objects.get(name="A").password, self.new_data["password"])

    def test_update_community_for_non_admins_should_fail(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # anonymous users have no access:
        response = self.client.put(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

        # alice is now regular group member, she cannot update the data:
        self.login_as("alice")
        response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        # ben is not a group member at all, he cannot update the data either:
        self.login_as("ben")
        response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        self.assertNotEqual(Community.objects.get(name="A").password, self.new_data["password"])


    def test_delete_community_works_for_group_admins(self):
        # bob is group admin, he can delete the group:
        self.login_as("bob")
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Community.objects.filter(name="A").count(), 0)

    def test_delete_community_for_non_admins_should_fail(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # anonymous users have no access
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

        # alice is now regular group member, she cannot update the data:
        self.login_as("alice")
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        # ben is not a group member at all, he cannot update the data either:
        self.login_as("ben")
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

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

    def test_get_membership(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # anonymous users have no access:
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

        # bob is group admin and it's his data, he sees the data:
        self.login_as("bob")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ['user', 'community', 'is_admin', 'is_approved', 'time_created']
        )
        self.assertEqual(response.data["user"], self.USER)

        # alice is group member, she sees the data:
        self.login_as("alice")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ['user', 'community', 'is_admin', 'is_approved', 'time_created']
        )
        self.assertEqual(response.data["user"], self.USER)

        # ben is not a group member, he sees nothing:
        self.login_as("ben")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")


    def test_update_membership_works_for_group_admins(self):
        # bob is group admin, he can update the data:
        self.login_as("bob")

        # let's say he is tired of being an admin
        new_data = {"is_admin": False}
        response = self.client.put(self.url, new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            ['user', 'community', 'is_admin', 'is_approved', 'time_created']
        )
        self.assertEqual(response.data["is_admin"], False)
        self.assertFalse(Membership.objects.get(
            community_id=self.COMMUNITY, user_id=self.USER).is_admin)

    def test_update_community_for_non_admins_should_fail(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # anonymous users have no access:
        response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

        # alice is a regular group member, she cannot update the data:
        self.login_as("alice")
        response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        # ben is not a group member at all, he cannot update the data either:
        self.login_as("ben")
        response = self.client.put(self.url, self.new_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        self.assertTrue(Membership.objects.get(
            community_id=self.COMMUNITY, user_id=self.USER).is_admin)


    def test_delete_membership_works_for_group_admins(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        ALICE_ID = alice.id
        community.join(alice)

        url = reverse(
            'communities:membership-detail',  
            kwargs={
                'community_id': self.COMMUNITY,
                'user_id': ALICE_ID,
            }
        )
        # bob is group admin, he can delete alice:
        self.login_as("bob")
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=ALICE_ID).count(), 0)

        # but he cannot delete himself because he is an admin:
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")
        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=self.USER).count(), 1)


    def test_users_can_leave_a_group(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        ALICE_ID = alice.id
        community.join(alice)

        url = reverse(
            'communities:membership-detail',  
            kwargs={
                'community_id': self.COMMUNITY,
                'user_id': ALICE_ID,
            }
        )
        # bob is group admin, he can delete alice:
        self.login_as("alice")
        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.data, None)
        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=ALICE_ID).count(), 0)


    def test_delete_membership_for_non_admins_should_fail(self):
        community = Community.objects.get(name="A")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

        # anonymous users have no access
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "Authentication credentials were not provided.")

        # alice is a regular group member, she cannot delete a member:
        self.login_as("alice")
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        # ben is not a group member at all, he cannot delete the data either:
        self.login_as("ben")
        response = self.client.delete(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        self.assertEqual(Membership.objects.filter(
            community_id=self.COMMUNITY, user_id=self.USER).count(), 1)


