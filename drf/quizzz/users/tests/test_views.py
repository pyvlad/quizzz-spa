# DRF testing: https://www.django-rest-framework.org/api-guide/testing/
# Django testing: https://docs.djangoproject.com/en/3.2/topics/testing/
# email: https://docs.djangoproject.com/en/3.2/topics/testing/tools/#topics-testing-email
# Unittest: https://docs.python.org/3/library/unittest.html#unittest.TestCase
import re
from django.urls import reverse
from django.core import mail
from django.core.cache import caches
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



class ThrottlingTest(SetupUsersMixin, APITestCase):
    """
    Ensure throttling works for registration attempts.
    """
    def setUp(self):
        self.url = reverse('users:register')
        self.get_payload = lambda x: {
            "username": f"bob{x}", 
            "password": self.USERS["bob"]["password"], 
            "email": f"bob{x}@example.com",
        }

    def test_registration_throttling(self):
        cache = caches['default']
        cache.clear()

        # assert that correct values have been set
        self.assertEqual(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["burst"], "60/minute")
        self.assertEqual(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["sustained"], "1200/day")

        # test that on N requests returns 200, N+1 returns 429 
        ORIGINAL_SETTING = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["burst"]
        TEST_VALUE = 3

        from rest_framework.settings import api_settings
        api_settings.DEFAULT_THROTTLE_RATES["burst"] = f'{TEST_VALUE}/minute'

        for i in range(TEST_VALUE):
            response = self.client.post(self.url, self.get_payload(i))
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.logout()
        response = self.client.post(self.url, self.get_payload(i+1))
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        api_settings.DEFAULT_THROTTLE_RATES["burst"] = ORIGINAL_SETTING
        cache.clear()



class RequestPasswordResetEmailViewTest(SetupUsersMixin, APITestCase):
    """
    Ensure password can be reset.
    """
    def setUp(self):
        self.url = reverse('users:request-password-reset-email')
        self.payload = {
            "email": self.USERS["bob"]["email"],
        }
        
    def test_normal(self):
        """
        When correct email is submitted, an email with password reset link is sent.
        """
        with self.assertNumQueries(3):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIsNone(response.data)

        # one email was sent with url to reset password:
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, '[Quizzz] Reset Your Password')

    def test_throttling(self):
        """
        Only three attempts per day are permitted.
        """
        for i in range(settings.QUIZZZ_PASSWORD_RESET_REQUESTS_PER_EMAIL_PER_DAY):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(len(mail.outbox), settings.QUIZZZ_PASSWORD_RESET_REQUESTS_PER_EMAIL_PER_DAY)
        
        # next attempts for this email are blocked
        response = self.client.post(self.url, self.payload)
        self.assert_validation_failed(response, ["Too many requests. Try again tomorrow."])
        self.assertEqual(len(mail.outbox), settings.QUIZZZ_PASSWORD_RESET_REQUESTS_PER_EMAIL_PER_DAY)

        # but not for other emails
        response = self.client.post(self.url, {"email": self.USERS["alice"]["email"]})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1 + settings.QUIZZZ_PASSWORD_RESET_REQUESTS_PER_EMAIL_PER_DAY)


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

    def test_email_plus_suffix_behaviour(self):
        """
        Provided email suffix is stripped.
        Providing same email with different suffix means duplicate user. 
        """
        self.assertEqual(CustomUser.objects.filter(email="bob@example.com").count(), 0)
       
        # a. create user 'bob'
        payload = self.payload.copy()
        payload["email"] = "bob+1@example.com"
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.filter(email="bob@example.com").count(), 1)

        # b. try creating user 'bob2'
        self.client.logout()
        payload = self.payload.copy()
        payload["email"] = "bob+2@example.com"
        response = self.client.post(self.url, payload)
        self.assert_validation_failed(response, data={
            "username": ["A user with that username already exists."],
        })
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.filter(email="bob@example.com").count(), 1)



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

    def test_throttling(self):
        """
        Only 10 attempts per hour are permitted.
        """
        cache = caches['default']
        cache.clear()

        for i in range(10):
            response = self.client.post(self.url, self.payload)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue("sessionid" in response.cookies)
            self.logout()

        # next attempt for this IP is blocked
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        # but works for another IP:
        response = self.client.post(self.url, self.payload, REMOTE_ADDR='127.0.0.2')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        cache.clear()




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

        self.assert_authentication_required(get_response)

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