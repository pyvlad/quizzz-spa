from . import USERS, COMMUNITIES

ADMIN_IDS = {
    "group1": USERS["bob"]["id"],
    "group2": USERS["alice"]["id"],
    "group3": USERS["bob"]["id"],
}

REGULAR_MEMBER_IDS = {
    "group1": [USERS["alice"]["id"]]
}

MEMBERSHIPS = {}

for community, user_id in ADMIN_IDS.items():
    membership = {
        "community_id": COMMUNITIES[community]["id"],
        "user_id": user_id,
        "is_admin": True,
        "is_approved": True,
    } 
    MEMBERSHIPS[(membership["community_id"], membership["user_id"])] = membership

for community, user_ids in REGULAR_MEMBER_IDS.items():
    for user_id in user_ids:
        membership = {
            "community_id": COMMUNITIES[community]["id"],
            "user_id": user_id,
            "is_admin": False,
            "is_approved": True,
        }
        MEMBERSHIPS[(membership["community_id"], membership["user_id"])] = membership
