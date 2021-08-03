from quizzz.communities.models import Community, Membership
from quizzz.users.models import CustomUser

from .data import COMMUNITIES, ADMIN_IDS, MEMBERSHIPS
from . import SetupUsersMixin


class SetupCommunityDataMixin(SetupUsersMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()

    @classmethod
    def set_up_communities(cls):
        # create communities and admin memberships:
        for community_name, community_obj in COMMUNITIES.items():
            admin = CustomUser.objects.get(pk=ADMIN_IDS[community_name])
            Community.create(admin, **community_obj)
        cls.update_pk_sequence(Community)

        # create regular memberships
        for membership in MEMBERSHIPS.values():
            if not membership["is_admin"]:
                Membership.objects.create(**membership)
        
        cls.COMMUNITIES = COMMUNITIES
        cls.MEMBERSHIPS = MEMBERSHIPS

        # act on group1 by default
        cls.GROUP = "group1"
        cls.GROUP_ID = cls.COMMUNITIES[cls.GROUP]["id"]

    def assert_membership_required(self, get_response):
        """
        Helper method to check permissions for 'group1' (default self.GROUP).
        Send request as 'ben' who is not a member of 'group1'.
        """
        if self.GROUP != "group1":
            raise RuntimeError("self.GROUP must be 'group1'")
        self.login_as("ben")
        with self.assertNumQueries(3):
            self.assert_not_authorized(get_response())

    def assert_group_admin_rights_required(self, get_response, num_queries=3):
        """
        Helper method to check permissions for 'group1' (default self.GROUP).
        Send request as 'alice' who is a member of 'group1' but not an admin.
        """
        if self.GROUP != "group1":
            raise RuntimeError("self.GROUP must be 'group1'")
        self.login_as("alice")
        with self.assertNumQueries(num_queries):
            self.assert_not_authorized(get_response())

    def bob_joins_group2(self):
        """ Reusable helper method """
        community = Community.objects.get(name="group2")
        bob = CustomUser.objects.get(username="bob")
        community.join(bob)