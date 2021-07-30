from quizzz.users.models import CustomUser

from .data import USERS
from . import BaseTestUtils


class SetupUsersMixin(BaseTestUtils):
    """
    Mixin with user data and methods for login/logout.
    """
    @classmethod
    def setUpTestData(cls):
        cls.set_up_users()

    @classmethod
    def set_up_users(cls):
        for user_obj in USERS.values():
            CustomUser.objects.create_user(**user_obj)
        cls.update_pk_sequence(CustomUser)
        cls.USERS = USERS

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
        return self.login(username, self.USERS[username]["password"])

    def assert_authentication_required(self, get_response):
        self.logout()
        with self.assertNumQueries(0):
            self.assert_not_authenticated(get_response())