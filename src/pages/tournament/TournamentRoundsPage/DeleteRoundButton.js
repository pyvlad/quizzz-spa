import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import { useSubmit } from 'common/useApi';
import FormFieldErrors from 'common/FormFieldErrors';


const DeleteRoundButton = ({ round, onRoundDelete }) => {
  
  const groupId = useSelector(selectActiveGroupId);

  // initial data
  const { id } = round;

  // submission handling
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () =>  await api.deleteRound(groupId, id),
    () => onRoundDelete()
  )

  const handleDeleteWithConfirmation = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(`Are you sure you want to delete this round?`)
    if (confirmed) handleSubmit(e);
  }

  // errors
  const { non_field_errors: nonFieldErrors } = formErrors || {};

  // render
  return (
    <React.Fragment>
      <FormFieldErrors errors={ nonFieldErrors } />
      <div className="text-right">
        <button 
          className="btn bg-red text-red" 
          onClick={ handleDeleteWithConfirmation } 
          disabled={ isLoading } 
        >
          Delete
        </button>
      </div>
    </React.Fragment>
  )
}

export default DeleteRoundButton;