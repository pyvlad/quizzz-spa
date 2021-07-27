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

    def bob_joins_group2(self):
        """ Reusable helper method """
        community = Community.objects.get(name="group2")
        bob = CustomUser.objects.get(username="bob")
        community.join(bob)