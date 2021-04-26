import React from 'react';

import { logout } from 'api';


const LogoutForm = ({ onSuccess, onFail }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    logout()
      .then(({ status }) => {
        if (status === 200) onSuccess();
        else onFail();
      });
  }

  return (
    <form onSubmit={ handleSubmit }>
      <input type="submit" value="Log out."/>
    </form>
  );
}

export default LogoutForm;