from django.db import connection
from rest_framework import status


def update_pk_sequence(model):
    """
    This function is needed when we insert objects with manually set primary keys 
    into a table with an automatically incremented primary key field.
    Otherwise, Postgres errors with a duplicate key IntegrityError.
    https://dba.stackexchange.com/a/46139
    https://dba.stackexchange.com/a/210599
    """
    if connection.vendor == "sqlite":
        pass
    elif connection.vendor == "postgresql":
        table_name = model.objects.model._meta.db_table
        sequence_name = table_name + '_id_seq'
        sql = f"SELECT setval('{sequence_name}', (SELECT max(id) FROM {table_name}));"
        with connection.cursor() as cursor:
            cursor.execute(sql)



def assert_403_not_authenticated(self, response):
    # why not 401? see:
    # https://www.django-rest-framework.org/api-guide/authentication/#unauthorized-and-forbidden-responses
    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    self.assertEqual(
        response.data["detail"], 
        "Authentication credentials were not provided."
    )


def assert_403_not_authorized(self, response):
    self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    self.assertEqual(
        response.data["detail"],
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
        ['detail', 'form_errors']
    )
    self.assertEqual(
        response.data["detail"], 
        error if error else "Bad request."
    )
    if data:
        self.assertDictEqual(response.data["form_errors"], data)