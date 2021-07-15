import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import * as api from 'api';
import * as helpMessages from 'helpMessages';
import { showMessage } from 'state';
import urlFor from 'urls';

import { useSubmit } from 'common/useApi';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormFieldErrors from 'common/FormFieldErrors';
import FormWrapper from 'common/FormWrapper';
import useTitle from 'common/useTitle';



const PasswordResetPage = ({ tokenUUID }) => {

  useTitle("Reset Password");

  return (
    <FormWrapper>
      <PasswordResetForm tokenUUID={tokenUUID} />
    </FormWrapper>
  )
}


const PasswordResetForm = ({ tokenUUID }) => {

  // globals
  const history = useHistory();
  const dispatch = useDispatch();

  // local state
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [clientErrors, setClientErrors] = React.useState([]);

  // submission state
  const { isLoading, statusCode, formErrors, errorMessage, handleSubmit } = useSubmit(
    async () => await api.resetPassword(tokenUUID, { password }),
    () => {
      dispatch(showMessage("Your password has been changed.", "success"));
      history.push(urlFor('HOME'));
    }
  );

  // modified submission HANDLER with an extra password check
  const handleSubmitWithPasswordCheck = (e) => {
    e.preventDefault();
    
    setClientErrors([]);

    if (password === password2) {
      handleSubmit(e);
    } else {
      setPassword("");
      setPassword2("");
      setClientErrors(["Passwords do not match"]);
    }
  }

  // error handling
  const {
    non_field_errors: nonFieldErrors,
    password: passwordErrors,
  } = formErrors || {};

  // show error message
  React.useEffect(() => {
    if (errorMessage) {
      const message = (statusCode === 400) ? "Fix the errors and try again." : errorMessage;
      dispatch(showMessage(message, 'error'))
    }
  }, [statusCode, errorMessage, dispatch])

  // return component
  return (
    <Form onSubmit={ handleSubmitWithPasswordCheck }>
      <FormHeader text={"Password Reset Form"} />
      <FormHelp text={"Please select you new password."} />
      <FormFieldErrors errors={clientErrors} />
      <FormFieldErrors errors={nonFieldErrors} />
      <FormTextInput
        labelText="Password"
        value={password}
        onValueChange={e => setPassword(e.target.value)}
        errors={passwordErrors}
        type="password"
        helpText={ helpMessages.password }
        placeholder="enter your password"
      />
      <FormTextInput
        labelText="Repeat Password"
        value={password2}
        onValueChange={e => setPassword2(e.target.value)}
        type="password"
        helpText="Type the password one more time to confirm it."
        placeholder="enter your password again"
      />
      <div className="form__item text-centered">
        <input 
          type="submit"
          value="Register"
          className="btn btn--primary btn--mw150"
          disabled={isLoading}
        />
      </div>
    </Form>
  );
}

export default PasswordResetPage;