# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import CustomUser
from .setup_mixin import SetupUsersMixin
from quizzz.common import test_utils


class RegistrationViewTest(APITestCase):
    """
    Ensure registration view works as expected.
    """
    def setUp(self):
        self.url = reverse('users:register')
        self.user = {"username": "bob", "password": "dog12345"}

    def test_normal(self):
        """
        User with correct credentials is registered and created in database.
        """
        with self.assertNumQueries(2):  # (1) unique check (2) insert 
            response = self.client.post(self.url, self.user, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, None)
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.get().username, self.user["username"])

    def test_password_too_short(self):
        with self.assertNumQueries(1):  # (1) unique check
            response = self.client.post(
                self.url, 
                {"username": "bob", "password": "dog"}, 
                format='json'
            )
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.",
            data={"password": [
                ("This password is too short. "
                 "It must contain at least 8 characters. "
                 "This password is too common.")
            ]}
        )
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_empty_username(self):
        with self.assertNumQueries(0):
            response = self.client.post(
                self.url, 
                {"username": "", "password": "dog12345"}, 
                format='json'
            )
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.",
            data={"username": ["This field may not be blank."]})
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_duplicate_user(self):
        """
        Trying to create same user returns Bad Request.
        """
        # a. create user 'bob'
        response = self.client.post(self.url, self.user, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 1)

        # b. try creating same user again
        with self.assertNumQueries(1):  # (1) unique check
            response = self.client.post(self.url, self.user, format='json')

        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.",
            data={"username": ["A user with that username already exists."]})
        self.assertEqual(CustomUser.objects.count(), 1)




class LoginViewTest(SetupUsersMixin, APITestCase):
    """
    Ensure login view works as expected.
    """
    def setUp(self):
        self.set_up_users()
        self.url = reverse('users:login')

    def test_normal(self):
        """
        User with correct credentials is logged in.
        """
        user = self.users["bob"]

        with self.assertNumQueries(9):
            response = self.client.post(
                self.url, 
                {"username": user["username"], "password": user["password"]}
            )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            list(response.data.keys()), 
            ["id", "username", "first_name", "last_name", "email", 
             "is_active", "date_joined", "last_login"]
        )
        self.assertTrue("sessionid" in response.cookies)

    def test_wrong_password(self):
        """
        Users with wrong password are not logged in.
        """
        user = self.users["bob"]
        bad_credentials = {"username": user["username"], "password": "wrooooong12345"}

        with self.assertNumQueries(1):
            response = self.client.post(self.url, bad_credentials)
            
        test_utils.assert_400_validation_failed(self, response, 
            error="Bad data submitted.",
            data={"non_field_errors": ["Wrong credentials."]})
        self.assertTrue("sessionid" not in response.cookies)




class LogoutViewTest(SetupUsersMixin, APITestCase):
    """
    Ensure logout view works as expected.
    """
    def setUp(self):
        self.set_up_users()
        self.url = reverse('users:logout')

    def test_normal(self):
        """
        Logs a user out by unsetting the session cookies.
        """
        self.login_as("bob")
        with self.assertNumQueries(4): # (1-2) - request.user, (3-4) - load session & delete  
            response = self.client.post(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, None)
        self.assertTrue("sessionid" in response.cookies)
        self.assertEqual(response.cookies["sessionid"].value, "")

    def test_for_anonymous_user(self):
        """
        Works for not logged in users just as well.
        """
        # 200 is returned, but since there is no cookie - it is not unset:
        with self.assertNumQueries(0):
            response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" not in response.cookies)

        # but sending expired empty cookies does unset the cookie again:
        self.login_as("bob")

        response = self.client.post(self.url)
        response = self.client.post(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" in response.cookies)
        self.assertEqual(response.cookies["sessionid"].value, "")




class UserListViewTest(SetupUsersMixin, APITestCase):
    def setUp(self):
        self.set_up_users()
        self.url = reverse('users:list')

    def test_normal(self):
        # view is not shown to anonymous users
        with self.assertNumQueries(0):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authenticated(self, response)

        # view is not shown to non super users
        self.login_as("bob")
        with self.assertNumQueries(2):
            response = self.client.get(self.url)
        test_utils.assert_403_not_authorized(self, response)

        # view is shown to superuser
        self.login_as("admin")
        with self.assertNumQueries(3):
            response = self.client.get(self.url)
        self.assertEqual(len(response.data), len(self.users))
        self.assertEqual(response.status_code, status.HTTP_200_OK)



class TimeViewTest(SetupUsersMixin, APITestCase):
    def setUp(self):
        self.set_up_users()

    def test_normal(self):
        """ 
        Ensure time view works as expected.
        """
        url = reverse('users:time')

        # view is not shown to anonymous users
        response = self.client.get(url)
        test_utils.assert_403_not_authenticated(self, response)

        # view is shown to authenticated users
        self.login_as("bob")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # test after logout
        self.logout()
        response = self.client.get(url)
        test_utils.assert_403_not_authenticated(self, response)