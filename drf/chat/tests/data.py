from users.tests.data import USERS
from communities.tests.data import COMMUNITIES


EXTRA_MEMBERSHIPS = [
    {
       "user_id": USERS["alice"]["id"],
       "community_id": COMMUNITIES["group1"]["id"],
       "is_admin": False,
       "is_approved": True,
    }
]


MESSAGES = [
    {
        "id": 1,
        "text": "group1 message from bob",
        "user_id": USERS["bob"]["id"],
        "community_id": COMMUNITIES["group1"]["id"]
    },
    {
        "id": 2,
        "text": "group1 message from alice",
        "user_id": USERS["alice"]["id"],
        "community_id": COMMUNITIES["group1"]["id"]
    },
    {
        "id": 3,
        "text": "group2 message from alice",
        "user_id": USERS["alice"]["id"],
        "community_id": COMMUNITIES["group2"]["id"]
    }
]