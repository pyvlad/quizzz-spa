import React from 'react';
import _uniqueId from 'lodash/uniqueId';

import FormFieldErrors from 'common/FormFieldErrors';


const FormCheckboxInput = ({ 
  labelText, 
  value, 
  onValueChange,
  errors,
  helpText=null,
}) => {
  
  const [htmlId] = React.useState(_uniqueId('html-id-'));

  return (
    <div className="form__item form__item--outlined">
      <div style={{ display: "flex" }}>
        <input 
          type="checkbox"
          checked={ value } 
          onChange={ onValueChange }
          id={ htmlId }
          style={{ width: "1rem", height: "1rem" }}
        />
        <label htmlFor={ htmlId } className="ml-2">
          { labelText }
        </label>
      </div>
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

export default FormCheckboxInput;