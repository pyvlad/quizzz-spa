import React from 'react';
import _uniqueId from 'lodash/uniqueId';

import FormFieldErrors from 'common/FormFieldErrors';


const FormTextInput = ({ 
  labelText, 
  value, 
  onValueChange, 
  errors, 
  type="text",
  disabled=false,
}) => {

  const [htmlId] = React.useState(_uniqueId('html-id-'));

  return (
    <div className="form__item">
      <label className="form__label" htmlFor={ htmlId }>
        { labelText }
      </label>
      <input 
        type={ type } 
        value={ value } 
        onChange={ onValueChange }
        className="form__input"
        id={ htmlId }
        disabled={ disabled }
      />
      <FormFieldErrors errors={ errors } />
    </div>
  )
}

export default FormTextInput;