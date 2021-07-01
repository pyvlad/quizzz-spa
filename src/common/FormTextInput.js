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
  helpText=null,
  placeholder=null,
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
        placeholder={ placeholder }
      />
      <FormFieldErrors errors={ errors } />
      {
        helpText
        ? <div className="form__input-help">
            { helpText }
          </div>
        : null
      }
    </div>
  )
}

export default FormTextInput;