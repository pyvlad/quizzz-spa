/* User model */
// https://docs.djangoproject.com/en/3.1/ref/contrib/auth/#user-model

export const username = "May contain alphanumeric, _, @, +, . and - characters.";
/* 
  Other validators: Required. 150 characters or fewer. ASCII characters only.
*/

export const password = "Must contain at least 8 characters.";
/* 
  Validators: see settings.AUTH_PASSWORD_VALIDATORS
  https://docs.djangoproject.com/en/3.1/topics/auth/passwords/#included-validators
  
  To get list of all validators' helper texts:
    from django.contrib.auth.password_validation import password_validators_help_texts
    password_validators_help_texts()
*/