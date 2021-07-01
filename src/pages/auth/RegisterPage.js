import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { selectCurrentUser, selectAuthLoading, setCurrentUser } from 'state';
import * as api from 'api';
import urlFor from 'urls';
import * as helpMessages from 'helpMessages';

import useSubmit from 'common/useSubmit';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormFieldErrors from 'common/FormFieldErrors';
import FormWrapper from 'common/FormWrapper';



const RegisterPage = () => {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);

  return (user && !loading)
    ? <Redirect to={ urlFor('HOME') } />
    : <FormWrapper>
        <RegisterForm />
      </FormWrapper>
}


const RegisterForm = () => {

  const dispatch = useDispatch();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [clientErrors, setClientErrors] = React.useState([]);

  const { isLoading, errors, handleSubmit, setErrors } = useSubmit(
    async () => {
      return await api.register({ username, password, email });
    },
    user => dispatch(setCurrentUser(user))
  );

  const {
    non_field_errors: nonFieldErrors,
    username: usernameErrors,
    password: passwordErrors,
    email: emailErrors,
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
      <FormHeader text={"Registration Form"} />
      <FormHelp text={"Please fill in this form to create an account."} />
      <FormFieldErrors errors={clientErrors} />
      <FormFieldErrors errors={nonFieldErrors} />
      <FormTextInput 
        labelText="Username"
        value={username}
        onValueChange={e => setUsername(e.target.value)}
        errors={usernameErrors}
        type="text"
        helpText={ helpMessages.username }
        placeholder="enter your username"
      />
      <FormTextInput
        labelText="Email"
        value={email}
        onValueChange={e => setEmail(e.target.value)}
        errors={emailErrors}
        type="email"
        helpText="Valid email is required."
        placeholder="enter your email"
      />
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


export default RegisterPage;