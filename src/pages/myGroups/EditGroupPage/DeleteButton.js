import React from 'react';


const DeleteButton = ({ text, onClick, disabled=false }) => (
  <div className='form__item'>
    <button 
      className="btn btn--red btn--block"
      onClick={ onClick }
      disabled={ disabled }
    >
      { text }
    </button>
  </div>
)

export default DeleteButton;