import React from 'react';

import 'styles/form.scss';


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