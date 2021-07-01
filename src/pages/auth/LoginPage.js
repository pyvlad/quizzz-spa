import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { selectCurrentUser, selectAuthLoading, fetchLogin } from 'state';
import urlFor from 'urls';

import FormWrapper from 'common/FormWrapper';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';



const LoginPage = () => {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);

  return (user && !loading) 
    ? <Redirect to={ urlFor('HOME') } />
    : <FormWrapper>
        <LoginForm />
        <p>
          Forgot Your Password? <a href={urlFor('REQUEST_RESET')}>Click to Reset It</a>
        </p>
      </FormWrapper>
}


const LoginForm = () => {
  const dispatch = useDispatch();

  const [username, onUsernameChange] = useFormInput("");
  const [password, onPasswordChange] = useFormInput("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchLogin({ username, password }));
  }

  return (
    <Form onSubmit={ handleSubmit }>
      <FormHeader text="Log In Form" />
      <FormHelp text="Please enter your credentials." />
      <FormTextInput 
        labelText="Name:"
        value={ username }
        onValueChange={ onUsernameChange }
        type="text"
      />
      <FormTextInput
        labelText="Password:"
        value={ password }
        onValueChange={ onPasswordChange }
        type="password"
      />
      <div className="form__item text-centered">
        <input 
          type="submit"
          value="Log In"
          className="btn btn--primary btn--mw150"
        />
      </div>
    </Form>
  );
}

function useFormInput(initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const handleChange = (e) => setValue(e.target.value);
  return [value, handleChange];
}


export default LoginPage;