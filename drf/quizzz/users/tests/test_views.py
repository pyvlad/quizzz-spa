# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# email: https://docs.djangoproject.com/en/3.2/topics/testing/tools/#topics-testing-email
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
import re
from django.urls import reverse
from django.core import mail
from django.conf import settings
from rest_framework import status
from rest_framework.test import APITestCase
from itsdangerous import TimedJSONWebSignatureSerializer

from quizzz.common.test_mixins import SetupUsersMixin, BaseTestUtils

from ..models import CustomUser


USER_EXPECTED_KEYS = [
    "id", "username", "first_name", "last_name", "email", 
    "is_active", "date_joined", "last_login", "is_email_confirmed"
]


class RegistrationViewTest(BaseTestUtils, APITestCase):
    """
    Ensure registration view works as expected.
    """
    def setUp(self):
        self.url = reverse('users:register')
        self.payload = {
            "username": "bob", 
            "password": "dog12345", 
            "email": "bob@example.com"
        }
        self.expected_keys = USER_EXPECTED_KEYS

    def test_normal(self):
        """
        User with correct credentials is registered and created in database.
        Created user is automatically logged in.
        An email with confirmation url is sent.
        Confirmation URL works: user's `is_email_confirmed` field is toggled.
        """
        with self.assertNumQueries(11): 
            # (1) username unique check (2) email unique check (3) insert 
            # (4-11) login stuff
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertFalse(response.data["is_email_confirmed"])
            self.assertTrue("sessionid" in response.cookies)

        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.get().username, self.payload["username"])

        # EMAIL
        # one email was sent with confirmation url:
        self.assertEqual(len(mail.outbox), 1)
        # email subject:
        self.assertEqual(mail.outbox[0].subject, '[Quizzz] Confirm Your Account')
        # confirmation url contains a token with user's username encoded in it:
        pattern = re.compile(settings.QUIZZZ_FRONTEND_BASE_URL + "/auth/confirm-email/(?P<token>.*?)/")
        m = pattern.search(mail.outbox[0].body)
        token = m.group("token")
        s = TimedJSONWebSignatureSerializer(settings.SECRET_KEY)
        token_data = s.loads(token.encode('utf-8'))
        self.assertEqual(token_data["user_name"], self.payload["username"])

        # CONFIRM EMAIL
        # finish registration by visiting the confirmation URL:
        confirm_email_url = reverse('users:confirm-email-link', kwargs={"token": token})
        with self.assertNumQueries(4):
            response = self.client.get(confirm_email_url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertTrue(response.data["is_email_confirmed"])
        self.assertTrue(CustomUser.objects.get().is_email_confirmed)

    def test_password_too_short(self):
        """
        Choosing password that does not satisfy settings.AUTH_PASSWORD_VALIDATORS
        results in a 400 response with a form error message for `password` field.
        """
        bad_data = self.payload.copy()
        bad_data["password"] = "dog"
        with self.assertNumQueries(2): # (1-2) unique checks
            response = self.client.post(self.url, bad_data)
            self.assert_validation_failed(response, data={
                "password": [
                    ("This password is too short. "
                    "It must contain at least 8 characters. "
                    "This password is too common.")
                ]
            })
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_empty_username(self):
        """
        `username` cannot be blank.
        """
        bad_data = self.payload.copy()
        bad_data["username"] = ""
        with self.assertNumQueries(1): # (1) email unique check 
            response = self.client.post(self.url, bad_data)
            self.assert_validation_failed(response, data={
                "username": ["This field may not be blank."]
            })
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_empty_email(self):
        """
        `email` field must be present and non-blank.
        """
        bad_data = self.payload.copy()
        bad_data.pop("email")
        with self.assertNumQueries(1):  # username unique check
            response = self.client.post(self.url, bad_data)
            self.assert_validation_failed(response, data={
                "email": ["This field is required."]
            })
        self.assertEqual(CustomUser.objects.count(), 0)

        bad_data = self.payload.copy()
        bad_data["email"] = ""
        with self.assertNumQueries(1):  # username unique check
            response = self.client.post(self.url, bad_data)
            self.assert_validation_failed(response, data={
                "email": ["This field may not be blank."]
            })
        self.assertEqual(CustomUser.objects.count(), 0)

    def test_duplicate_user(self):
        """
        Trying to create same user returns 400 with 
        form error messages for 'username' and 'email'.
        """
        # a. create user 'bob'
        response = self.client.post(self.url, self.payload)
        self.assertEqual(CustomUser.objects.count(), 1)

        # b. try creating same user again
        self.client.logout()
        with self.assertNumQueries(2):  # (1-2) unique checks
            response = self.client.post(self.url, self.payload)
            self.assert_validation_failed(response, data={
                "username": ["A user with that username already exists."],
                "email": ["user with this email address already exists."],
            })
        self.assertEqual(CustomUser.objects.count(), 1)




class LoginViewTest(SetupUsersMixin, APITestCase):
    """
    Ensure login view works as expected.
    """
    def setUp(self):
        self.url = reverse('users:login')
        self.payload = {
            "username": "bob",
            "password": self.USERS["bob"]["password"],
        }
        self.expected_keys = USER_EXPECTED_KEYS
        
    def test_normal(self):
        """
        User with correct credentials is logged in.
        """
        with self.assertNumQueries(9):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertListEqual(list(response.data.keys()), self.expected_keys)
            self.assertTrue("sessionid" in response.cookies)

    def test_wrong_password(self):
        """
        User with wrong password is not logged in.
        """
        bad_credentials = self.payload.copy()
        bad_credentials["password"] = "wrooooong12345"

        with self.assertNumQueries(1):
            response = self.client.post(self.url, bad_credentials)
            self.assert_validation_failed(response, data={
                "non_field_errors": ["Wrong credentials."]
            })
            self.assertTrue("sessionid" not in response.cookies)




class LogoutViewTest(SetupUsersMixin, APITestCase):
    """
    Ensure logout view works as expected.
    """
    def setUp(self):
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
    """
    Superusers only can get the full list of users.
    """
    def setUp(self):
        self.url = reverse('users:list')

    def test_normal(self):
        """
        Full list of users can be viewed by superusers only.
        """
        get_response = lambda: self.client.get(self.url)

        # authentication is required:
        with self.assertNumQueries(0):
            self.assert_not_authenticated(get_response())

        # view is not shown to non-superusers
        self.login_as("bob")
        with self.assertNumQueries(2):
            self.assert_not_authorized(get_response())

        # view is shown to superuser
        self.login_as("admin")
        with self.assertNumQueries(3):
            response = get_response()
            self.assertEqual(len(response.data), len(self.USERS))
            self.assertEqual(response.status_code, status.HTTP_200_OK)