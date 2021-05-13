# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import CustomUser
from users.tests.setup_mixin import SetupUsersMixin


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
        response = self.client.post(self.url, self.user, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, None)
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.get().username, self.user["username"])

    def test_password_too_short(self):
        response = self.client.post(
            self.url, 
            {"username": "bob", "password": "dog"}, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertListEqual(list(response.data.keys()), ["userMessage", "data"])
        self.assertEqual(response.data["userMessage"], "Bad form submitted.")
        self.assertDictEqual(
            response.data["data"], 
            {"password": ["This password is too short. It must contain at least 8 characters. This password is too common."]}
        )
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_empty_username(self):
        response = self.client.post(
            self.url, 
            {"username": "", "password": "dog12345"}, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertListEqual(list(response.data.keys()), ["userMessage", "data"])
        self.assertEqual(response.data["userMessage"], "Bad form submitted.")
        self.assertDictEqual(
            response.data["data"], 
            {"username": ["This field may not be blank."]}
        )
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
        response = self.client.post(self.url, self.user, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertListEqual(list(response.data.keys()), ["userMessage", "data"])
        self.assertEqual(response.data["userMessage"], "Bad form submitted.")
        self.assertDictEqual(
            response.data["data"], 
            {"username": ["A user with that username already exists."]}
        )
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
        user = self.user_by_name["bob"]

        response = self.client.post(
            self.url, 
            {"username": user["username"], "password": user["password"]}, 
            format="json"
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
        user = self.user_by_name["bob"]
        bad_credentials = {"username": user["username"], "password": "wrooooong12345"}

        response = self.client.post(
            self.url, 
            bad_credentials, 
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertDictEqual(
            response.data, 
            {"userMessage": "Wrong credentials."}
        )
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
        response = self.client.post(self.url, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, None)
        self.assertTrue("sessionid" in response.cookies)
        self.assertEqual(response.cookies["sessionid"].value, "")

    def test_for_anonymous_user(self):
        """
        Works for not logged in users just as well.
        """
        # 200 is returned, but since there is no cookie - it is not unset:
        response = self.client.post(self.url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" not in response.cookies)

        # but sending expired empty cookies does unset the cookie again:
        self.login_as("bob")

        response = self.client.post(self.url, format="json")
        response = self.client.post(self.url, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" in response.cookies)
        self.assertEqual(response.cookies["sessionid"].value, "")




class UserListViewTest(SetupUsersMixin, APITestCase):
    def setUp(self):
        self.set_up_users()
        self.url = reverse('users:list')

    def test_normal(self):
        # view is not shown to anonymous users
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.data["detail"], 
            "Authentication credentials were not provided."
        )
        # why not 401? see:
        # https://www.django-rest-framework.org/api-guide/authentication/#unauthorized-and-forbidden-responses

        # view is not shown to non super users
        self.login_as("bob")
        response = self.client.get(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"],
            "You do not have permission to perform this action.")

        # view is shown to superuser
        self.login_as("admin")
        response = self.client.get(self.url, format="json")
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
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # view is shown to authenticated users
        self.login_as("bob")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # test logout
        self.logout()
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)