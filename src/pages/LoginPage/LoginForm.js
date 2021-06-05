import React from 'react';
import { useDispatch } from 'react-redux';

import { fetchLogin } from 'state';


const LoginForm = () => {
  const dispatch = useDispatch();

  const [username, onUsernameChange] = useFormInput("");
  const [password, onPasswordChange] = useFormInput("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchLogin({ username, password }));
  }

  return (
    <React.Fragment>
      <form onSubmit={ handleSubmit } className="form">
        <div className="form__header">
          Log In Form
        </div>
        <div className="form__item">
          <div className="form__help">
            Please enter your credentials.
          </div>
        </div>
        <div className="form__item">
          <label className="form__label" htmlFor="loginUsernameInput">
            Name:
          </label>
          <input 
            type="text" 
            name="username" 
            value={ username } 
            onChange={ onUsernameChange }
            className="form__input"
            id="loginUsernameInput"
          />
        </div>
        <div className="form__item">
          <label className="form__label" htmlFor="loginPasswordInput">
            Password:
          </label>
          <input 
            type="password" 
            name="password" 
            value={ password } 
            onChange={ onPasswordChange }
            className="form__input"
            id="loginPasswordInput"
          />
        </div>
        <div className="form__item text-centered">
          <input 
            type="submit"
            value="Log In"
            className="btn btn--primary btn--mw150"
          />
        </div>
      </form>
      <p>
        Forgot Your Password? <a href="">Click to Reset It</a>
      </p>
    </React.Fragment>
  );
}

function useFormInput(initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const handleChange = (e) => setValue(e.target.value);
  return [value, handleChange];
}

export default LoginForm;