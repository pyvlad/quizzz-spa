from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CustomUser


class NewUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'email']

    def validate_password(self, value):
        """
        Validate whether the password meets all validator requirements.
        Default validators: settings.AUTH_PASSWORD_VALIDATORS.
        
        If the password is valid, return ``None``.
        If the password is invalid, raise ValidationError with all error messages.
        """
        try:
            validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(" ".join(error.messages))
        return value

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data["password"])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, max_length=150, 
        validators=[ASCIIUsernameValidator])
    password = serializers.CharField(required=True, max_length=64)

    def validate(self, data):
        """
        Authenticate user on correct credentials.
        """
        user = authenticate(username=data["username"], password=data["password"])
        if user is None:
            raise serializers.ValidationError("Wrong credentials.")
        data["user"] = user           
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 
                  'is_active', 'date_joined', 'last_login', 'is_email_confirmed']


class UserEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(label='Email address', max_length=254)


class UserPasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['password']

    def validate_password(self, value):
        """
        Validate whether the password meets all validator requirements.
        Default validators: settings.AUTH_PASSWORD_VALIDATORS.
        
        If the password is valid, return ``None``.
        If the password is invalid, raise ValidationError with all error messages.
        """
        try:
            validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(" ".join(error.messages))
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data["password"])
        instance.save()
        return instance


# NOTES

# *************
# SERIALIZATION
# *************
# "ModelSerializer" classes don't do anything particularly magical, 
# they are simply a shortcut for creating serializer classes:
#   - An automatically determined set of fields.
#   - Simple default implementations for the 
#       ~ create(self, validated_data)  
#       ~ update(self, instance, validated_data) methods.
# https://www.django-rest-framework.org/tutorial/1-serialization/#using-modelserializers

# To see what the resulting serializer looks like:
    # $ print(repr(serializer)) 
# Output:
    # CustomUserSerializer(<CustomUser: admin>):
    #     username = CharField(help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, validators=[<django.contrib.auth.validators.UnicodeUsernameValidator object>, <UniqueValidator(queryset=CustomUser.objects.all())>])
    #     first_name = CharField(allow_blank=True, max_length=150, required=False)
    #     last_name = CharField(allow_blank=True, max_length=150, required=False)
    #     email = EmailField(allow_blank=True, label='Email address', max_length=254, required=False)
    #     is_staff = BooleanField(help_text='Designates whether the user can log into this admin site.', label='Staff status', required=False)
    #     is_active = BooleanField(help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', label='Active', required=False)
    #     date_joined = DateTimeField(required=False)
    #     is_superuser = BooleanField(help_text='Designates that this user has all permissions without explicitly assigning them.', label='Superuser status', required=False)
    #     groups = PrimaryKeyRelatedField(help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', many=True, queryset=Group.objects.all(), required=False)
    #     user_permissions = PrimaryKeyRelatedField(help_text='Specific permissions for this user.', many=True, queryset=Permission.objects.all(), required=False)
    #     password = CharField(max_length=128)
    #     last_login = DateTimeField(allow_null=True, required=False)


# *****************
# USER MODEL 
# (all fields of the User model built into Django)
# *****************
# [AbstractUser]
# 'username', 
#     # models.CharField(
#     #     _('username'),
#     #     max_length=150,
#     #     unique=True,
#     #     help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
#     #     validators=[username_validator],
#     #     error_messages={
#     #         'unique': _("A user with that username already exists."),
#     #     },
#     # )
# 'first_name',
#     # models.CharField(_('first name'), max_length=150, blank=True)
# 'last_name',
#     # models.CharField(_('last name'), max_length=150, blank=True)
# 'email', 
#     # models.EmailField(_('email address'), blank=True)
# 'is_staff',
#     # models.BooleanField(
#     #     _('staff status'),
#     #     default=False,
#     #     help_text=_('Designates whether the user can log into this admin site.'),
#     # )
# 'is_active',
#     # models.BooleanField(
#     #     _('active'),
#     #     default=True,
#     #     help_text=_(
#     #         'Designates whether this user should be treated as active. '
#     #         'Unselect this instead of deleting accounts.'
#     #     ),
#     # )
# 'date_joined',
#     #  models.DateTimeField(_('date joined'), default=timezone.now)

# [PermissionsMixin]: AbstractUser inherits from it
# 'is_superuser',
#     # models.BooleanField(
#     #     _('superuser status'),
#     #     default=False,
#     #     help_text=_(
#     #         'Designates that this user has all permissions without '
#     #         'explicitly assigning them.'
#     #     ),
#     # )
# 'groups',
#     # models.ManyToManyField(
#     #     Group,
#     #     verbose_name=_('groups'),
#     #     blank=True,
#     #     help_text=_(
#     #         'The groups this user belongs to. A user will get all permissions '
#     #         'granted to each of their groups.'
#     #     ),
#     #     related_name="user_set",
#     #     related_query_name="user",
#     # )
# 'user_permissions',
#     # models.ManyToManyField(
#     #     Permission,
#     #     verbose_name=_('user permissions'),
#     #     blank=True,
#     #     help_text=_('Specific permissions for this user.'),
#     #     related_name="user_set",
#     #     related_query_name="user",
#     # )

# [AbstractBaseUser]: AbstractUser inherits from it
# 'password',
#     # models.CharField(_('password'), max_length=128)
# 'last_login',
#     # models.DateTimeField(_('last login'), blank=True, null=True)