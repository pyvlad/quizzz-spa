import React from 'react';
import _uniqueId from 'lodash/uniqueId';

import FormFieldErrors from 'common/FormFieldErrors';


const FormCheckboxInput = ({ 
  labelText, 
  value, 
  onValueChange,
  errors
}) => {
  
  const [htmlId] = React.useState(_uniqueId('html-id-'));

  return (
    <div className="form__item">
      <input 
        type="checkbox"
        checked={ value } 
        onChange={ onValueChange }
        className="form__input"
        id={ htmlId }
      />
      <label htmlFor={ htmlId }>
        { labelText }
      </label>
      <FormFieldErrors errors={ errors } />
    </div>
  )
}

export default FormCheckboxInput;