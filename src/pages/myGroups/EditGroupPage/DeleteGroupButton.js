import React from 'react';

import * as api from 'api';
import { useSubmit } from 'common/useApi';


const DeleteGroupButton = ({ groupId, onGroupDelete }) => {
  
  // submission state
  const { isLoading, handleSubmit } = useSubmit(
    async () => await api.deleteCommunity(groupId),
    () => onGroupDelete()
  )
  
  const handleSubmitWithConfirmation = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to delete this group?");
    if (confirmed) handleSubmit(e);
  }

  // return component
  return (
    <div className='form__item'>
      <button 
        className="btn btn--red btn--block"
        onClick={ handleSubmitWithConfirmation }
        disabled={ isLoading }
      >
        Delete
      </button>
    </div>
  )
}

export default DeleteGroupButton;