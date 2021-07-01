import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';

import { selectCurrentUser, selectAuthLoading } from 'state';
import * as api from 'api';
import * as helpMessages from 'helpMessages';
import urlFor from 'urls';

import useSubmit from 'common/useSubmit';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormFieldErrors from 'common/FormFieldErrors';
import FormWrapper from 'common/FormWrapper';



const PasswordResetPage = ({ tokenUUID }) => {
  
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);

  return (user && !loading)
    ? <Redirect to={ urlFor('HOME') } />
    : <FormWrapper>
        <PasswordResetForm tokenUUID={tokenUUID} />
      </FormWrapper>
}


const PasswordResetForm = ({ tokenUUID }) => {

  const history = useHistory();

  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [clientErrors, setClientErrors] = React.useState([]);

  const { isLoading, errors, handleSubmit, setErrors } = useSubmit(
    async () => await api.resetPassword(tokenUUID, { password }),
    () => history.push(urlFor('HOME'))
  );

  const {
    non_field_errors: nonFieldErrors,
    password: passwordErrors,
  } = errors;


  const handleSubmitWithPasswordCheck = (e) => {
    e.preventDefault();
    
    setClientErrors([]);
    setErrors({});

    if (password === password2) {
      handleSubmit(e);
    } else {
      setPassword("");
      setPassword2("");
      setClientErrors(["Passwords do not match"]);
    }
  }

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