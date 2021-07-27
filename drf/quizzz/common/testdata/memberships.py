from . import USERS, COMMUNITIES


ADMIN_IDS = {
    "group1": USERS["bob"]["id"],
    "group2": USERS["alice"]["id"],
    "group3": USERS["bob"]["id"],
}


EXTRA_MEMBERSHIPS = [
    {
       "user_id": USERS["alice"]["id"],
       "community_id": COMMUNITIES["group1"]["id"],
       "is_admin": False,
       "is_approved": True,
    }
]