import React from 'react';

import * as api from 'api';
import useSubmit from 'common/useSubmit';
import FormFieldErrors from 'common/FormFieldErrors';


const QuizDeleteButton = ({ quizId, groupId, onFinished }) => {

  const { isLoading, errors, handleSubmit } = useSubmit(
    async () => api.deleteQuiz(groupId, quizId),
    onFinished
  )

  const handleDeleteWithConfirm = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(`Are you sure you want to delete this quiz?`)
    if (confirmed) handleSubmit(e);
  }

  const { non_field_errors: nonFieldErrors } = errors;

  return ( 
    <React.Fragment>
      <FormFieldErrors errors={ nonFieldErrors } />
      <div className='form__item bg-grey'>
        <button 
          className="btn btn--red btn--mw150" 
          onClick={ handleDeleteWithConfirm }
          disabled={ isLoading }
        >
          Delete
        </button>
        <div className='form__help'>
          Delete the quiz.
        </div>
      </div>
    </React.Fragment>

  )
}

export default QuizDeleteButton;