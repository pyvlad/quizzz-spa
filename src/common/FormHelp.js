import React from 'react';


const FormHelp = ({ text }) => {
  return (
    <div className="form__item">
      <div className="form__help">
        { text }
      </div>
    </div>
  )
}

export default FormHelp;