from communities.models import Community
from users.models import CustomUser

from users.tests.setup_mixin import SetupUsersMixin


COMMUNITIES = [
    {"id": 1, "name": "A", "password": "1"},
    {"id": 2, "name": "B", "password": "2"},
    {"id": 3, "name": "C", "password": "3"},
]
ADMINS = {
    "A": "bob",
    "B": "alice",
    "C": "bob",
}


class SetupCommunityDataMixin(SetupUsersMixin):
    def set_up_community_data(self):
        self.set_up_users()

        for c in COMMUNITIES:
            admin = CustomUser.objects.get(username=ADMINS[c["name"]])
            Community.create(admin, **c)

        self.communities = COMMUNITIES
        self.community_by_name = {c["name"]: c for c in COMMUNITIES}
        self.community_by_id = {c["id"]: c for c in COMMUNITIES}