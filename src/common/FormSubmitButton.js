import React from 'react';


const FormSubmitButton = ({ text, disabled }) => (
  <div className="form__item text-centered">
    <input 
      type="submit"
      value={ text }
      className="btn btn--primary btn--block"
      disabled={ disabled }
    />
  </div>
)

export default FormSubmitButton;