import React from 'react';

import 'styles/form.scss';
import 'styles/btn.scss';


const QuizDeleteButton = ({ onClick }) => {
  return (   
    <div className='form__item bg-grey'>
      <button className="btn btn--red btn--mw150" onClick={ onClick }>
        Delete
      </button>
      <div className='form__help'>
        Delete the quiz.
      </div>
    </div>
  )
}

export default QuizDeleteButton;