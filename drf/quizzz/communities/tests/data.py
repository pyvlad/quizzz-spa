from quizzz.users.tests.data import USERS


COMMUNITIES = {
    "group1": {
        "id": 1, 
        "name": "group1", 
        "password": "pass1"
    },
    "group2": {
        "id": 2, 
        "name": "group2", 
        "password": "pass2"
    },
    "group3": {
        "id": 3,
        "name": "group3",
        "password": "pass3"   
    }
}


ADMIN_IDS = {
    "group1": USERS["bob"]["id"],
    "group2": USERS["alice"]["id"],
    "group3": USERS["bob"]["id"],
}