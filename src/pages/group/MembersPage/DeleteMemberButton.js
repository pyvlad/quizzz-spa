import React from 'react';

import * as api from 'api';

import useSubmit from 'common/useSubmit';
import FormFieldErrors from 'common/FormFieldErrors';


const DeleteMemberButton = ({ membership, onMemberDelete }) => {
  
  // initial data
  const { 
    community: groupId,
    user: { 
      id: userId,
      username,
    }
  } = membership;

  // submission handling
  const { isLoading, errors, handleSubmit } = useSubmit(
    async () =>  await api.deleteMembership(groupId, userId),
    () => onMemberDelete()
  )

  const handleDeleteWithConfirmation = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(`Are you sure you want to kick ${ username } out of this group?`)
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

export default DeleteMemberButton;