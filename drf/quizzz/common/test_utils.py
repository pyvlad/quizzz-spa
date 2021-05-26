from rest_framework import status


def assert_403_not_authenticated(self, response):
    # why not 401? see:
    # https://www.django-rest-framework.org/api-guide/authentication/#unauthorized-and-forbidden-responses
    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    self.assertEqual(
        response.data["error"], 
        "Authentication credentials were not provided."
    )


def assert_403_not_authorized(self, response):
    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    self.assertEqual(
        response.data["error"],
        "You do not have permission to perform this action."
    )


def assert_400_validation_failed(self, response, error=None, data=None):
    """
    Helper to avoid code repetition.
    """
    self.assertEqual(
        response.status_code, 
        status.HTTP_400_BAD_REQUEST
    )
    self.assertListEqual(
        list(response.data.keys()), 
        ["error", "data"]
    )
    self.assertEqual(
        response.data["error"], 
        error if error else "Bad data submitted."
    )
    if data:
        self.assertDictEqual(response.data["data"], data)