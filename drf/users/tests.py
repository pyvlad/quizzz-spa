# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import CustomUser


class UsersTests(APITestCase):

    USER = {"username": "bob", "password": "dogofbob"}

    def login(self, username="bob", password="dogofbob"):
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


    def test_registration_view(self):
        """
        Ensure registration view works as expected.
        """
        url = reverse('users:register')

        # submitting bad credentials returns Bad Request
        bad_data = [
            ("bob", "dog"),     # password too short
            ("", "dogofbob"),   # empty username
        ]
        for credentials in bad_data:
            data = dict(zip(["username", "password"], credentials))
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CustomUser.objects.count(), 0)

        # user with correct credentials is registered and created in database
        response = self.client.post(url, self.USER, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.get().username, self.USER["username"])

        # cannot create same user
        response = self.client.post(url, self.USER, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CustomUser.objects.count(), 1)


    def test_login_view(self):
        """
        Ensure login view works as expected.
        """
        url = reverse('users:login')

        CustomUser.objects.create_user(**self.USER)
        
        # users with bad credentials are not logged in
        bad_credentials = self.USER.copy().update({"password": "wrooooong"})    
        response = self.client.post(url, bad_credentials, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue("sessionid" not in response.cookies)

        # user with correct credentials is logged in
        response = self.client.post(url, self.USER, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" in response.cookies)


    def test_logout_view(self):
        """
        Ensure logout view works as expected.
        """
        url = reverse('users:logout')

        # logs a user out by unsetting the session cookies
        self.login()
        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" in response.cookies)
        self.assertEqual(response.cookies["sessionid"].value, "")

        # works for not logged in users just as well
        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("sessionid" in response.cookies)
        self.assertEqual(response.cookies["sessionid"].value, "")


    def test_current_user_view(self):
        """
        Ensure current user view works as expected.
        """
        url = reverse('users:current-user')

        # anonymous users get 401
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # logged in users get their profiles
        self.login(**self.USER)
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["username"], self.USER["username"])


    def test_time_view(self):
        """ 
        Ensure time view works as expected.
        """
        url = reverse('users:time')

        # view is not shown to anonymous users
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # view is shown to authenticated users
        self.login()
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)