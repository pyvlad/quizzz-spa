import React from 'react';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import * as api from 'api';
import { setCurrentUser } from 'state';
import FormFieldErrors from 'common/FormFieldErrors';
import urlFor from 'urls';


const EmailConfirmationPage = ({ token }) => {

  const dispatch = useDispatch();

  const [success, setSuccess] = React.useState(null); 
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    async function fetchData() {
      try {
        const user = await api.confirmEmail(token);
        dispatch(setCurrentUser(user));
        setSuccess(true);
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
        setSuccess(false);
      }
    }
    fetchData();
  }, [token, dispatch, setErrors, setSuccess])

  const {
    non_field_errors: nonFieldErrors
  } = errors;

  return (success === null)
    ? <div>
        Checking the link. Please wait...
      </div>
    : (
        (success === true)
        ? <Redirect to={ urlFor('HOME') } />
        : <FormFieldErrors errors={nonFieldErrors} />
      )
}

export default EmailConfirmationPage;