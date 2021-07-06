import React from 'react';


const Form = ({ onSubmit, children }) => (
  <form onSubmit={ onSubmit } className="form">
    { children }
  </form>
)

export default Form;