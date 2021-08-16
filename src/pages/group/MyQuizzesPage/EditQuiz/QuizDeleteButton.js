import React from 'react';

import * as api from 'api';
import { useSubmit } from 'common/useApi';
import FormFieldErrors from 'common/FormFieldErrors';


const QuizDeleteButton = ({ quizId, groupId, onFinished }) => {

  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => api.deleteQuiz(groupId, quizId),
    onFinished
  )

  const handleDeleteWithConfirm = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(`Are you sure you want to delete this quiz?`)
    if (confirmed) handleSubmit(e);
  }

  const { non_field_errors: nonFieldErrors } = formErrors || {};

  return ( 
    <React.Fragment>
      <FormFieldErrors errors={ nonFieldErrors } />
      <div className='form__item bg-grey'>
        <div style={{ display: "flex", alignItems: "center"}}>
          <button 
            className="btn btn--red btn--mw150" 
            onClick={ handleDeleteWithConfirm }
            disabled={ isLoading }
          >
            Delete
          </button>
          <div className='form__help p-2'>
            Delete this quiz.
          </div>
        </div>
      </div>
    </React.Fragment>

  )
}

export default QuizDeleteButton;