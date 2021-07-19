from quizzz.common.test_utils import update_pk_sequence
from quizzz.users.tests.setup_mixin import SetupUsersMixin

from quizzz.communities.models import Community
from quizzz.users.models import CustomUser

from .data import COMMUNITIES, ADMIN_IDS


class SetupCommunityDataMixin(SetupUsersMixin):
    def set_up_community_data(self):
        self.set_up_users()

        for community_name, community_obj in COMMUNITIES.items():
            admin = CustomUser.objects.get(pk=ADMIN_IDS[community_name])
            Community.create(admin, **community_obj)
        update_pk_sequence(Community)
        
        self.communities = COMMUNITIES
        self.admin_ids = ADMIN_IDS

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