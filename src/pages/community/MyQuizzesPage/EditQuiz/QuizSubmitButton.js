import React from 'react';

import 'styles/form.scss';
import 'styles/btn.scss';


const QuizSubmitButton = ({ onClick }) => {
  return (
    <div className='form__item bg-grey'>
      <input 
        className="btn btn--primary btn--mw150" 
        type="submit" 
        name="finalize_me" 
        value="Submit"
        onClick={onClick}
      />
      <div className='form__help'>
        Submit the quiz to the group's quiz pool if the quiz is ready.
      </div>
    </div>
  )
}

export default QuizSubmitButton;