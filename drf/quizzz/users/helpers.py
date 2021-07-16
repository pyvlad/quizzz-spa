from django.core.mail import send_mail
from django.template.loader import get_template
from django.conf import settings
from django.contrib.auth import get_user_model
from itsdangerous import TimedJSONWebSignatureSerializer

from .models import PasswordResetToken


def generate_email_confirmation_token(user, valid_seconds=3600):
    s = TimedJSONWebSignatureSerializer(settings.SECRET_KEY, valid_seconds)
    token = s.dumps({
        'user_id': user.id, 
        'user_name': user.username,
        'user_email': user.email,
    }).decode('utf-8')
    return token


def validate_email_confirmation_token(token):
    s = TimedJSONWebSignatureSerializer(settings.SECRET_KEY)

    try:
        data = s.loads(token.encode('utf-8'))
    except:
        return None

    User = get_user_model()
    try:
        user = User.objects.get(pk=data["user_id"])
    except User.DoesNotExist:
        return None
        
    return user


def send_confirmation_email(user):
    token = generate_email_confirmation_token(user)
    token_url = f"{settings.QUIZZZ_FRONTEND_BASE_URL}/auth/confirm-email/{token}/"
    context = {'username': user.username, "token_url": token_url}
    send_mail(
        subject='[Quizzz] Confirm Your Account',
        from_email=None, # use the value of the DEFAULT_FROM_EMAIL setting
        recipient_list=[user.email],
        message=get_template('users/confirmation_email.txt').render(context),
        html_message=get_template('users/confirmation_email.html').render(context),
    )




def generate_password_reset_token(user):
    token = PasswordResetToken()
    token.create_uuid()
    token.user = user
    token.save()
    return token


def get_password_reset_token(token_uuid):
    try:
        token = PasswordResetToken.objects.get(uuid=token_uuid)
    except PasswordResetToken.DoesNotExist:
        return None
    return token


def send_password_reset_email(user):
    token = generate_password_reset_token(user)
    token_url = f"{settings.QUIZZZ_FRONTEND_BASE_URL}/auth/password-reset/{token.uuid}/"
    context = { 'username': user.username, "token_url": token_url }
    send_mail(
        subject='[Quizzz] Reset Your Password',
        from_email=None, # use the value of the DEFAULT_FROM_EMAIL setting
        recipient_list=[user.email],
        message=get_template('users/reset_password_email.txt').render(context),
        html_message=get_template('users/reset_password_email.html').render(context),
    )