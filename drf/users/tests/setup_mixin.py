from users.models import CustomUser


USERS = [
    {"id": 1, "username": "bob", "password": "dog12345"},
    {"id": 2, "username": "alice", "password": "cat12345"},
    {"id": 3, "username": "ben", "password": "frog12345"},
    {"id": 4, "username": "admin", "password": "qwerty123", "is_superuser": True}
]


class SetupUsersMixin:
    """
    Mixin with user data and methods for login/logout.
    """
    def set_up_users(self):
        for user in USERS:
            CustomUser.objects.create_user(**user)
        self.users = USERS
        self.user_by_name = {u["username"]: u for u in USERS}
        self.user_by_id = {u["id"]: u for u in USERS}

    def login(self, username, password):
        """
        Helper function to log in as certain user. 
        Creates new user if it does not exist.
        More on self.client.login: 
        https://www.django-rest-framework.org/api-guide/testing/#loginkwargs
        https://docs.djangoproject.com/en/3.2/topics/testing/tools/#django.test.Client.login
        """
        credentials = {"username": username, "password": password}
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            CustomUser.objects.create_user(**credentials)
        finally:
            r = self.client.login(**credentials)
            self.assertTrue(r)

    def logout(self):
        self.client.logout()

    def login_as(self, username):
        self.logout()
        return self.login(username, self.user_by_name[username]["password"])
