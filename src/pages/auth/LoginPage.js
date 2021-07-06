import React from 'react';
import { useDispatch } from 'react-redux';

import { setCurrentUser, showMessage } from 'state';
import urlFor from 'urls';
import * as api from 'api';

import useSubmit from 'common/useSubmit';
import FormWrapper from 'common/FormWrapper';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';



const LoginPage = () => (
  <FormWrapper>
    <LoginForm />
    <p>
      Forgot Your Password? <a href={ urlFor('REQUEST_RESET') }>Click to Reset It</a>
    </p>
  </FormWrapper>
)


const LoginForm = () => {

  // globals
  const dispatch = useDispatch();

  // local state
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  // submission state
  const { isLoading, statusCode, errorMessage, handleSubmit } = useSubmit(
    async () => await api.login(username, password),
    user => {
      dispatch(showMessage(`${user.username}, welcome back!`, 'success'));
      dispatch(setCurrentUser(user));
    }
  );

  // show error message
  React.useEffect(() => {
    if (errorMessage) {
      const message = (statusCode === 400) ? "Incorrect credentials." : errorMessage;
      dispatch(showMessage(message, 'error'))
    }
  }, [statusCode, errorMessage, dispatch])

  // return component
  return (
    <Form onSubmit={ handleSubmit }>
      <FormHeader text="Log In Form" />
      <FormHelp text="Please enter your credentials." />
      <FormTextInput 
        labelText="Name:"
        value={ username }
        onValueChange={ e => setUsername(e.target.value) }
        type="text"
      />
      <FormTextInput
        labelText="Password:"
        value={ password }
        onValueChange={ e => setPassword(e.target.value) }
        type="password"
      />
      <div className="form__item text-centered">
        <input 
          type="submit"
          value="Log In"
          className="btn btn--primary btn--mw150"
          disabled={ isLoading }
        />
      </div>
    </Form>
  );
}

export default LoginPage;