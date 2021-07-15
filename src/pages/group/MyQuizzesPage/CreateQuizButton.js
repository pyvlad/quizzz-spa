import React from 'react';
import { useSelector } from 'react-redux';

import * as api from 'api';
import { selectActiveGroupId } from 'state';

import { useSubmit } from 'common/useApi';
import FormFieldErrors from 'common/FormFieldErrors';


const CreateQuizButton = ({ handleEditQuiz }) => {

  const groupId = useSelector(selectActiveGroupId);

  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => await api.createQuiz(groupId, {}),
    result => handleEditQuiz(result.id),
  )

  const { non_field_errors: nonFieldErrors } = formErrors || {};

  return (
    <div>
      <FormFieldErrors errors={ nonFieldErrors } />
      <button 
        className="btn btn--primary" 
        onClick={ handleSubmit }
        disabled={ isLoading }
      >
        Create Quiz
      </button>
    </div>
  )
}

export default CreateQuizButton;