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

        self.communities = COMMUNITIES
        self.admin_ids = ADMIN_IDS