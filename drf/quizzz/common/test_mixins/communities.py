from quizzz.common.test_utils import update_pk_sequence
from quizzz.common.testdata import COMMUNITIES, ADMIN_IDS

from quizzz.communities.models import Community
from quizzz.users.models import CustomUser

from . import SetupUsersMixin


class SetupCommunityDataMixin(SetupUsersMixin):

    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()
        cls.set_up_communities()

    @classmethod
    def set_up_communities(cls):
        for community_name, community_obj in COMMUNITIES.items():
            admin = CustomUser.objects.get(pk=ADMIN_IDS[community_name])
            Community.create(admin, **community_obj)

        update_pk_sequence(Community)
        
        cls.communities = COMMUNITIES
        cls.admin_ids = ADMIN_IDS

    def alice_joins_group1(self):
        """ Reusable helper method """
        community = Community.objects.get(name="group1")
        alice = CustomUser.objects.get(username="alice")
        community.join(alice)

    def bob_joins_group2(self):
        """ Reusable helper method """
        community = Community.objects.get(name="group2")
        bob = CustomUser.objects.get(username="bob")
        community.join(bob)