import React from 'react';


const LoginForm = ({ submitForm }) => {

  const [username, onUsernameChange] = useFormInput("");
  const [password, onPasswordChange] = useFormInput("");

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm(username, password);
  }

  return (
    <form onSubmit={ handleSubmit }>        
      <label>Name: 
        <input 
          type="text" 
          name="username" 
          value={ username } 
          onChange={ onUsernameChange } 
        />
      </label>
      <label>Password: 
        <input 
          type="password" 
          name="password" 
          value={ password } 
          onChange={ onPasswordChange } 
        />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

function useFormInput(initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const handleChange = (e) => setValue(e.target.value);
  return [value, handleChange];
}

export default LoginForm;