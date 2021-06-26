import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import useSubmit from 'common/useSubmit';
import FormFieldErrors from 'common/FormFieldErrors';


const DeleteTournamentButton = ({ tournament, onTournamentDelete }) => {
  
  const groupId = useSelector(selectActiveGroupId);

  // initial data
  const { id, name } = tournament;

  // submission handling
  const { isLoading, errors, handleSubmit } = useSubmit(
    async () =>  await api.deleteTournament(groupId, id),
    () => onTournamentDelete()
  )

  const handleDeleteWithConfirmation = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(`Are you sure you want to delete ${ name }?`)
    if (confirmed) handleSubmit(e);
  }

  // errors
  const { non_field_errors: nonFieldErrors } = errors;

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

export default DeleteTournamentButton;