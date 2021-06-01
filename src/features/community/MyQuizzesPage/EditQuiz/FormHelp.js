import React from 'react';

import 'styles/form.scss';


const FormHelp = () => {
  return (
    <div className="form__item">
      <div className="form__help">
        Please fill in the form below and hit 'save'.<br/>
        A saved quiz will remain available for updates 
        until you 'submit' it for a group competition.
      </div>
    </div>
  )
}

export default FormHelp;