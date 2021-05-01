import React from 'react';


const LogoutForm = ({ submitForm }) => {
  
  const handleSubmit = (event) => {
    event.preventDefault();
    submitForm();
  }

  return (
    <form onSubmit={ handleSubmit }>
      <input type="submit" value="Log out."/>
    </form>
  );
}

export default LogoutForm;