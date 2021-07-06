import React from 'react';

import * as api from 'api';

import useSubmit from 'common/useSubmit';
import FormFieldErrors from 'common/FormFieldErrors';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormCheckboxInput from 'common/FormCheckboxInput';


const EditMemberForm = ({ membership, onMemberUpdate }) => {

  // INITIAL FORM DATA
  const { 
    is_approved,
    is_admin: isAdmin,
    community: groupId,
    user: { 
      id: userId,
      username,
    }
  } = membership;

  // FORM STATE
  const [isApproved, setIsApproved] = React.useState(is_approved);
  
  // FORM SUBMISSION
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => {
      const payload = { is_admin: isAdmin, is_approved: isApproved };
      return await api.updateMembership(groupId, userId, payload);
    },
    updatedMembership => {
      onMemberUpdate(updatedMembership);
    }
  )

  // FORM ERRORS
  const {
    non_field_errors: nonFieldErrors,
    is_admin: isAdminErrors,
    is_approved: isApprovedErrors,
  } = formErrors || {};


  // RENDERING
  return (
    <Form>
      <FormFieldErrors errors={ nonFieldErrors } />
      <FormFieldErrors errors={ isAdminErrors } />
      <FormHeader text={ username } />
      <FormHelp text="Please specify user's status and hit 'save'." />
      <FormCheckboxInput 
        labelText="Accept this user as group member?"
        value={ isApproved }
        onValueChange={ (e) => setIsApproved(e.target.checked) }
        errors={ isApprovedErrors }  
      />
      <div className='form__item'>
        <button 
          className="btn btn--secondary btn--block" 
          onClick={ handleSubmit }
          disabled={ isLoading }
        >
          Save
        </button>
      </div>
    </Form>
  )
}

export default EditMemberForm;