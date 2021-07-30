from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase

from quizzz.common.test_mixins import SetupCommunityDataMixin

from quizzz.users.models import CustomUser
from quizzz.communities.models import Community, Membership


MEMBERSHIP_EXPECTED_KEYS = ['user', 'community', 'is_admin', 'is_approved', 'time_created']
COMMUNITY_EXPECTED_KEYS = ["id", "name", "password", "approval_required", "max_members", "time_created"]
MEMBER_USER_EXPECTED_KEYS = ['id', 'username', 'first_name', 'last_name', 'last_login']


class CommunityListTest(SetupCommunityDataMixin, APITestCase):
    """
    Superuser only can see all existing communities.
    """
    def setUp(self):
        self.num_communities = len(self.COMMUNITIES)

        self.url = reverse('communities:community-list')
        self.expected_keys = COMMUNITY_EXPECTED_KEYS

    def test_normal(self):
        """
        Superuser only can see get a list of all existing communities.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)

        # regular users have no access
        self.login_as("bob")
        with self.assertNumQueries(2):
            self.assert_not_authorized(get_response())

        # superuser has access
        self.login_as("admin")
        with self.assertNumQueries(3):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), self.num_communities)
            self.assertListEqual(list(response.data[0].keys()), self.expected_keys)



class UserCommunitiesTest(SetupCommunityDataMixin, APITestCase):
    """
    Each user can get a list of his memberships with nested `community` objects.
    """
    def setUp(self):
        # consider bob's community list:
        bob = CustomUser.objects.get(username="bob")
        self.num_bobs_communities = len(bob.communities.all())

        self.url = reverse(
            'communities:user-communities',  
            kwargs={'user_id': self.USERS["bob"]["id"]}
        )
        self.expected_keys = MEMBERSHIP_EXPECTED_KEYS
        self.community_expected_keys = COMMUNITY_EXPECTED_KEYS

    def test_normal(self):
        """
        Only the user himself can see his own list of communities.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)

        # Regular users cannot see someone else's list of communities:
        self.login_as("alice")
        with self.assertNumQueries(2):
            self.assert_not_authorized(get_response())

        # User can see his list of communities:
        self.login_as("bob")
        with self.assertNumQueries(3):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), self.num_bobs_communities)
            self.assertListEqual(list(response.data[0].keys()), self.expected_keys)
            self.assertListEqual(list(response.data[0]["community"].keys()), self.community_expected_keys)



class CreateCommunityTest(SetupCommunityDataMixin, APITestCase):
    """
    A registered user can create a new community.
    The view returns the user's new membership with nested community object.
    """
    def setUp(self):
        self.num_communities = len(self.COMMUNITIES)

        self.url = reverse('communities:create-community')
        self.payload = {
            "name": "group4"
        }
        self.expected_keys = MEMBERSHIP_EXPECTED_KEYS
        self.community_expected_keys = COMMUNITY_EXPECTED_KEYS

    def test_normal(self):
        """
        A regular registered user can create a new community with a unique name.
        """
        get_response = lambda: self.client.post(self.url, self.payload)

        self.assert_authentication_required(get_response)

        self.assertEqual(Community.objects.count(), self.num_communities)

        # Works for bob:
        self.login_as("bob")
        with self.assertNumQueries(5): # (1-2) request.user (3) unique check (4-5) com & mem
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertListEqual(list(response.data["community"].keys()), self.community_expected_keys)
        
        self.assertEqual(Community.objects.count(), self.num_communities + 1)

    def test_community_already_exists(self):
        """
        Community name must be unique.
        """
        bad_payload = {"name": "group1"}

        self.login_as("bob")
        with self.assertNumQueries(3):
            response = self.client.post(self.url, bad_payload)
            self.assert_validation_failed(response, data={
                "name": ["community with this name already exists."]
            })
        self.assertEqual(Community.objects.count(), self.num_communities)



class JoinCommunityTest(SetupCommunityDataMixin, APITestCase):
    """
    A registered user can join an existing community.
    The view returns the user's new membership with nested community object.
    """
    def setUp(self):
        # consider "ben" trying to join "group1":
        self.USER = "ben"
        self.USER_ID = self.USERS["ben"]["id"]

        self.num_memberships = Membership.objects.count()

        self.url = reverse('communities:join-community')
        self.payload = {
            "name": self.GROUP, 
            "password": self.COMMUNITIES[self.GROUP]["password"]
        }
        self.expected_keys = MEMBERSHIP_EXPECTED_KEYS
        self.community_expected_keys = COMMUNITY_EXPECTED_KEYS
    
    def test_normal(self):
        """
        A registered user who provides correct credentials becomes a regular group member:
        """
        get_response = lambda: self.client.post(self.url, self.payload)

        self.assert_authentication_required(get_response)
        
        self.assertEqual(Membership.objects.count(), self.num_memberships)

        # Works for a regular non-member:
        self.login_as(self.USER)
        with self.assertNumQueries(5): # (3) get com (4) member count (5) insert
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertListEqual(list(response.data["community"].keys()), self.community_expected_keys)
            self.assertEqual(response.data["user"], self.USER_ID)
            self.assertEqual(response.data["is_admin"], False)
            self.assertEqual(response.data["community"]["name"], self.payload["name"])
        
        self.assertEqual(Membership.objects.count(), self.num_memberships + 1)

    def test_max_members(self):
        """ 
        Can only join a group if max_members limit has not been reached.
        """
        self.login_as(self.USER)

        group_members = Membership.objects.filter(community_id=self.GROUP_ID).count()
        Community.objects.filter(pk=self.GROUP_ID).update(max_members=group_members)
        
        with self.assertNumQueries(4):
            response = self.client.post(self.url, self.payload)
            self.assert_validation_failed(response, data={
                "non_field_errors": ["This group has reached its member limit."]
            })
        self.assertEqual(Membership.objects.count(), self.num_memberships)

    def test_wrong_password(self):
        """
        Submitting wrong password returns an error.
        """
        self.login_as(self.USER)

        bad_credentials = self.payload.copy()
        bad_credentials["password"] = "wrooooong"

        with self.assertNumQueries(3):
            response = self.client.post(self.url, bad_credentials)
            self.assert_validation_failed(response, data={
                "non_field_errors": ["Wrong password."]
            })
        self.assertEqual(Membership.objects.count(), self.num_memberships)

    def test_wrong_group_name(self):
        """
        Submitting wrong group name returns an error.
        """
        self.login_as(self.USER)

        bad_credentials = self.payload.copy()
        bad_credentials["name"] = "does not exist"

        with self.assertNumQueries(3):
            response = self.client.post(self.url, bad_credentials)
            self.assert_validation_failed(response, data={
                "non_field_errors": ["No such group."]
            })
        self.assertEqual(Membership.objects.count(), self.num_memberships)



class JoinAlreadyJoinedCommunityTest(SetupCommunityDataMixin, APITransactionTestCase):
    # Special case requiring 'TransactionTestCase'.
    # Using TransactionTestCase here because in "test_member_already_exists"
    # IntegrityError is raised - TestCase wraps all code in a transaction, and 
    # cannot proceed when a DB query fails: 
    #   "An error occurred in the current transaction.
    #   You can't execute queries until the end of the 'atomic' block."
    def setUp(self):
        super().setUpTestData()
        self.num_memberships = Membership.objects.count()

        self.url = reverse('communities:join-community')
        self.payload = {
            "name": "group1", 
            "password": self.COMMUNITIES["group1"]["password"]
        }

    def test_member_already_exists(self):
        """ 
        Can only join a group once.
        """
        self.login_as("bob")

        with self.assertNumQueries(5):
            response = self.client.post(self.url, self.payload)
            self.assert_validation_failed(response, data={
                "non_field_errors": ["You are already a member of this group."]
            })
        self.assertEqual(Membership.objects.count(), self.num_memberships)



class MembershipListTest(SetupCommunityDataMixin, APITestCase):
    """
    A community member can get a list of all group members.
    """
    def setUp(self):
        self.num_members = Membership.objects.filter(community_id=self.GROUP_ID).count()

        self.url = reverse(
            'communities:community-members',
            kwargs={'community_id': self.COMMUNITIES[self.GROUP]["id"]}
        )
        self.expected_keys = MEMBERSHIP_EXPECTED_KEYS
        self.user_expected_keys = MEMBER_USER_EXPECTED_KEYS

    def test_normal(self):
        """
        Community members can view all its members.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        # alice is a regular member:
        self.login_as("alice")
        with self.assertNumQueries(4):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), self.num_members)

        # bob is group admin - he has access:
        self.login_as("bob")
        with self.assertNumQueries(4):  # (3) is member check (4) member list join on users
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), self.num_members)
            self.assertListEqual(list(response.data[0].keys()), self.expected_keys)
            self.assertListEqual(list(response.data[0]["user"].keys()), self.user_expected_keys)



class CommunityDetailTest(SetupCommunityDataMixin, APITestCase):
    def setUp(self):
        self.url = reverse(
            'communities:community-detail',  
            kwargs={'community_id': self.GROUP_ID}
        )
        self.update_payload = self.COMMUNITIES[self.GROUP].copy()
        self.new_password = "new-password"
        self.update_payload["password"] = self.new_password
        self.expected_keys = COMMUNITY_EXPECTED_KEYS

    def test_get_community(self):
        """
        A group member can get the `community` object.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response, 4)

        # alice is a regular group member, she sees the data:
        self.login_as("alice")
        with self.assertNumQueries(4):  # (3) member check (4) get data
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["name"], self.GROUP)

    def test_update_community_works_for_group_admins(self):
        """
        A group admin can update the corresponding `community` object.
        """
        get_response = lambda: self.client.put(self.url, self.update_payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        self.assertNotEqual(Community.objects.get(name=self.GROUP).password, self.new_password)

        # bob is group admin, he can update the data:
        self.login_as("bob")
        with self.assertNumQueries(6):  
            # (3) is admin check (4) select obj (5) new obj unique check (6) update  
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["password"], self.new_password)

        self.assertEqual(Community.objects.get(name=self.GROUP).password, self.new_password)

    def test_update_community_name_to_an_existing_one_fails(self):
        """
        New community name must stay unique.
        """
        self.login_as("bob")

        bad_payload = self.update_payload.copy()
        bad_payload["name"] = "group2"

        with self.assertNumQueries(5):
            response = self.client.put(self.url, bad_payload)
        self.assert_validation_failed(response, data={
            "name": ["community with this name already exists."]
        })
        self.assertEqual(Community.objects.filter(name="group2").count(), 1)

    def test_delete_community_works_for_group_admins(self):
        """
        A group admin can delete the corresponding `community` object.
        """
        get_response = lambda: self.client.delete(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        self.assertEqual(Community.objects.filter(name=self.GROUP).count(), 1)

        # bob is group admin, he can delete the group:
        self.login_as("bob")
        with self.assertNumQueries(9):
            # (5) select quizzes (6) del members (7) del chat (8) del tournaments (9) del com 
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(response.data, None)

        self.assertEqual(Community.objects.filter(name=self.GROUP).count(), 0)



class MembershipDetailTest(SetupCommunityDataMixin, APITestCase):
    def setUp(self):
        # consider bob's membership in group1:
        self.USER = "bob"
        self.USER_ID = self.USERS["bob"]["id"]
        
        self.url = reverse(
            'communities:membership-detail',  
            kwargs={
                'community_id': self.GROUP_ID,
                'user_id': self.USER_ID,
            }
        )
        # let's try making bob not an admin:
        self.update_payload = {"is_admin": False}
        self.expected_keys = MEMBERSHIP_EXPECTED_KEYS

    def test_get_membership(self):
        """
        A group member can get the `membership` object of any group member.
        """
        get_response = lambda: self.client.get(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response, 4)

        # alice is a regular group member, works for her:
        self.login_as("alice")
        with self.assertNumQueries(5): # (3) check membership (4) get mem (5) get com
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["user"]["id"], self.USER_ID)

        # bob is group admin and it's his data, works for him:
        self.login_as("bob")
        with self.assertNumQueries(5):
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["user"]["id"], self.USER_ID)

    def test_update_membership_works_for_group_admins(self):
        """
        A group admin can update each member's `membership` object.
        """
        get_response = lambda: self.client.put(self.url, self.update_payload)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)

        # alice is a regular group member, admin rights are required:
        self.login_as("alice")
        with self.assertNumQueries(3):
            self.assert_not_authorized(get_response())

        self.assertTrue(Membership.objects.get(
            community_id=self.GROUP_ID, user_id=self.USER_ID).is_admin)

        # bob is group admin, he can update the data:
        self.login_as("bob")
        with self.assertNumQueries(6): # (3) is admin check (4) get mem (5) update mem (6) get com (?)
            response = get_response()
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(list(response.data.keys()), self.expected_keys)
            self.assertEqual(response.data["is_admin"], False)

        self.assertFalse(Membership.objects.get(
            community_id=self.GROUP_ID, user_id=self.USER_ID).is_admin)

    def test_submit_bad_data_when_updating_membership(self):
        """
        Modified read-only fields are ignored.
        Trying to update with invalid values results in an error.
        """
        self.login_as("bob")

        # let's try to change bob's membership to ben
        # user is a read-only field so it is simply ignored:
        payload = {"user": {"id": self.USERS["ben"]["id"]}}
        with self.assertNumQueries(6):
            response = self.client.put(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["id"], self.USER_ID)

        # now, let's try to move bob's membership to another community
        # community is a read-only field so it is also ignored:
        payload = {"community": self.COMMUNITIES["group2"]["id"]}
        with self.assertNumQueries(6):
            response = self.client.put(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["community"], self.GROUP_ID)

        # now, let's try to submit bad value:
        payload = {"is_admin": "Of course!"}
        with self.assertNumQueries(4):
            response = self.client.put(self.url, payload)
        self.assert_validation_failed(response, data={
            "is_admin": ["Must be a valid boolean."]
        })
        self.assertTrue(Membership.objects.get(
            community_id=self.GROUP_ID, user_id=self.USER_ID).is_admin)

    def test_delete_membership_works_for_group_admins(self):
        """
        Only group admin can delete other user's memberships.
        Group admin cannot delete his own membership.
        """
        get_response = lambda: self.client.delete(self.url)

        self.assert_authentication_required(get_response)
        self.assert_membership_required(get_response)
        self.assert_group_admin_rights_required(get_response)

        # bob is group admin, but he cannot delete himself:
        self.login_as("bob")
        with self.assertNumQueries(3):
            self.assert_not_authorized(get_response())

        self.assertEqual(Membership.objects.filter(
            community_id=self.GROUP_ID, user_id=self.USER_ID).count(), 1)

        # bob is group admin, he can delete regular group members:
        USER = "alice"
        USER_ID = self.USERS[USER]["id"]
        url = reverse(
            'communities:membership-detail',
            kwargs={
                'community_id': self.GROUP_ID,
                'user_id': USER_ID,
            }
        )
        with self.assertNumQueries(5):
            response = self.client.delete(url)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(response.data, None)

        self.assertEqual(Membership.objects.filter(
            community_id=self.GROUP_ID, user_id=USER_ID).count(), 0)

    def test_users_can_leave_a_group(self):
        """
        A regular group member can delete his membership (i.e. leave the group).
        """
        USER = "alice"
        USER_ID = self.USERS[USER]["id"]
        url = reverse(
            'communities:membership-detail',
            kwargs={
                'community_id': self.GROUP_ID,
                'user_id': USER_ID,
            }
        )
        self.login_as("alice")
        with self.assertNumQueries(5):
            response = self.client.delete(url)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertEqual(response.data, None)
            
        self.assertEqual(Membership.objects.filter(
            community_id=self.GROUP_ID, user_id=USER_ID).count(), 0)