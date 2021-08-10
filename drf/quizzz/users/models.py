import uuid
import datetime
from django.utils import timezone
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class LowercaseEmailField(models.EmailField):
    """
    Override EmailField to convert emails to lowercase before saving.
    """
    @staticmethod
    def clean_email_value(value):
        """ Remove + suffix from email address if present """
        username, domain = value.split("@", 1)
        if "+" not in username:
            return value
        else:
            clean_username, suffix = username.split("+")
            return f"{clean_username}@{domain}"

    def to_python(self, value):
        """
        Convert email to lowercase.
        to_python() is called by deserialization and during the clean() method used from forms.
        https://docs.djangoproject.com/en/3.2/howto/custom-model-fields/#converting-values-to-python-objects
        """
        value = super(LowercaseEmailField, self).to_python(value)
        # Value can be None so check that it's a string before lowercasing.
        if isinstance(value, str):
            v = value.lower()
            v = self.clean_email_value(v)
            return v
        return value


class LowercaseCharField(models.CharField):
    """
    Override CharField to convert username to lowercase before saving.
    """
    def to_python(self, value):
        """ Convert char to lowercase. """
        value = super().to_python(value)
        # Value can be None so check that it's a string before lowercasing.
        return value.lower() if isinstance(value, str) else value


class CustomUser(AbstractUser):
    # remove default 'blank=True' and add unique=True:
    email = LowercaseEmailField(_('email address'), unique=True, null=False, blank=False)

    # add field to confirm email:
    is_email_confirmed = models.BooleanField(
        _('email confirmed'),
        default=False,
        help_text=_(
            'Designates whether the user has confirmed their email address.'
        ),
    )

    # get rid of unicode in usernames:
    username_validator = ASCIIUsernameValidator() 
    # field copied from AbstractBaseUser but with LowercaseCharField:
    username = LowercaseCharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Lower-case letters, digits and @/./+/-/_ only.'),
        validators=[username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )

    class Meta:
        db_table = "users"
        verbose_name = "user"



class PasswordResetToken(models.Model):
    uuid = models.CharField(max_length=36, unique=True, db_index=True)
    time_created = models.DateTimeField(auto_now_add=True)
    was_used = models.BooleanField(default=False)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def create_uuid(self):
        self.uuid = str(uuid.uuid4())

    def has_expired(self, valid_seconds=3600):
        return timezone.now() > self.time_created + datetime.timedelta(seconds=valid_seconds)

    class Meta:
        db_table = "tokens"
        verbose_name = "user"