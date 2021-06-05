import React from 'react';


const FormFieldErrors = ({ errors }) => (
  errors 
  ? <ul className="form__errors">
      {
        errors.map((e,i) => (
          <li className="form__error" key={i}>
            { e }
          </li>
        ))
        }
    </ul>
  : null
)  

export default FormFieldErrors;