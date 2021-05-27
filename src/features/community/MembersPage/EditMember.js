import React, { useState} from 'react';

import FormFieldErrors from 'features/common/FormFieldErrors';
import { fetchUpdateMembership, fetchDeleteMembership } from 'api';


const EditMember = ({ membership, onMemberUpdate, onMemberDelete }) => {
  const { 
    is_approved,
    is_admin: isAdmin,
    community: communityId,
    user: { 
      id: userId,
      username,
    }
  } = membership;

  const [isApproved, setIsApproved] = useState(is_approved);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const {
    non_field_errors: nonFieldErrors,
    is_admin: isAdminErrors,
    is_approved: isApprovedErrors,
  } = errors;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;
      const payload = { is_admin: isAdmin, is_approved: isApproved }

      let updatedMembership;

      try {
        updatedMembership = await fetchUpdateMembership(communityId, userId, payload);
        success = true;
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        onMemberUpdate(updatedMembership);
      }
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!isLoading) {

      const confirmed = window.confirm(
        `Are you sure you want to kick ${ username } out of this group?`);
      if (!confirmed) return;

      setErrors({});
      setIsLoading(true);
      let success = false;

      try {
        await fetchDeleteMembership(communityId, userId);
        success = true;
      } catch(err) {
        setErrors({non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        onMemberDelete();
      }
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
          <div className="paper-sm bg-grey p-2 p-md-4 my-2">
            <div className="form">
              <FormFieldErrors errors={ nonFieldErrors } />
              <div className="form__header">
                { username }
              </div>
              <div className="form__item">
                <div className="form__help">
                  Please specify user's status and hit 'save'.<br/>
                </div>
              </div>
              <div className='form__item'>
                <input 
                  type="checkbox" 
                  checked={ isApproved } 
                  onChange={ (e) => setIsApproved(e.target.checked) }
                  className="form__input"
                  id="isApprovedInput"
                />
                <label htmlFor="isApprovedInput">
                  Accept this user as group member?
                </label>
                <FormFieldErrors errors={ isApprovedErrors } />
                <FormFieldErrors errors={ isAdminErrors } />
              </div>
              <div className='form__item'>
                <button className="btn btn--secondary btn--block" onClick={ handleSubmit }>
                  Save
                </button>
              </div>
              <div className='form__item'>
                <button className="btn btn--red btn--block" onClick={ handleDelete }>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditMember;