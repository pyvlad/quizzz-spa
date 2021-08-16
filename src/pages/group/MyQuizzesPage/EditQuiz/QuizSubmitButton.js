import React from 'react';


const QuizSubmitButton = ({ onClick, disabled=false }) => {
  return (
    <div className='form__item bg-grey'>
      <div style={{ display: "flex", alignItems: "center"}}>
        <div>
          <input 
            className="btn btn--primary btn--mw150" 
            type="submit" 
            name="finalize_me" 
            value="Submit"
            onClick={onClick}
            disabled={ disabled }
          />
        </div>
        <div className='form__help p-2'>
          Finalize and add to group's quiz pool.<br/>
          No further changes will be possible.
        </div>
      </div>
    </div>
  )
}

export default QuizSubmitButton;