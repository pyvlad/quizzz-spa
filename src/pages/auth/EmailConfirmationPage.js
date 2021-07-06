import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import * as api from 'api';
import { setCurrentUser, showMessage, showLoadingOverlay, hideLoadingOverlay } from 'state';
import FormFieldErrors from 'common/FormFieldErrors';
import urlFor from 'urls';


const EmailConfirmationPage = ({ token, isLoggedIn }) => {

  // globals
  const dispatch = useDispatch();
  const history = useHistory();

  // local state
  const [error, setError] = React.useState("");

  // submit AJAX request to check the link
  React.useEffect(() => {
    async function fetchData() {
      dispatch(showLoadingOverlay());

      let success = false;
      let user = null;

      try {
        user = await api.confirmEmail(token);
        success = true;
      } catch(err) {
        dispatch(hideLoadingOverlay());
        // on invalid link / request fail show error message:
        setError((err.formErrors && err.formErrors.length) ? err.formErrors[0] : err.message);
      }

      if (success) {
        dispatch(hideLoadingOverlay());
        dispatch(showMessage("Email confirmed. Welcome to the site!", "success"));
        // this page can be accessed by non-logged in users
        // only update user if user is already logged in
        if (isLoggedIn) {
          dispatch(setCurrentUser(user));
        }
        history.push(urlFor("HOME"));
      }
    }
    fetchData();
  }, [token, dispatch, history, setError, isLoggedIn])

  // return component
  return (error 
    ? <FormFieldErrors errors={[error]} />
    : <div>Checking the link...</div>
  )
}

export default EmailConfirmationPage;