import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import FormFieldErrors from 'common/FormFieldErrors';
import * as api from 'api';
import urlFor from 'urls';

import { 
  addMembership, 
  deleteMembership, 
  updateGroup, 
  selectMyMembershipByGroupId, 
} from 'state';

import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormCheckboxInput from 'common/FormCheckboxInput';
import FormSubmitButton from 'common/FormSubmitButton';
import useSubmit from 'common/useSubmit';

import DeleteButton from './DeleteButton';



const EditGroupForm = ({ groupId }) => {
  
  // tools
  const dispatch = useDispatch();
  const history = useHistory();

  // INITIAL FORM DATA
  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const community = membership ? membership.community : null;

  // FORM STATE
  const [name, setName] = useState(community ? community.name : "");
  const [password, setPassword] = useState(community ? community.password : "");
  const [approve, setApprove] = useState(community ? community.approval_required : false);
  
  // FORM SUBMISSION
  const { 
    isLoading: isFormLoading, 
    errors: formErrors, 
    handleSubmit: handleFormSubmit,
  } = useSubmit(
    async () => {
      const payload = { name, password, approval_required: approve };
      const result = (community) 
        ? await api.updateCommunity(groupId, payload) // 'updatedCommunity'
        : await api.createCommunity(payload)          // 'membership'
      return result;
    },
    result => {
      dispatch(community ? updateGroup(result) : addMembership(result));
      history.push(urlFor('MY_GROUPS'))
    }
  )

  // FORM ERRORS
  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
    password: passwordErrors,
    approval_required: approveErrors,
  } = formErrors;


  // DELETE SUBMISSION HANDLING
  const { 
    isLoading: isDeleteLoading,
    errors: deleteFormErrors,
    handleSubmit: handleDelete,
  } = useSubmit(
    async () => await api.deleteCommunity(groupId),
    () => {
      dispatch(deleteMembership(groupId));
      history.push(urlFor('MY_GROUPS'));
    }
  )

  const handleDeleteWithConfirmation = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to delete this group?")
    if (!confirmed) {
      return;
    } else {
      handleDelete(e);
    }
  }

  // DELETE ERRORS
  const { non_field_errors: deleteErrors } = deleteFormErrors;

  // RENDERING
  // make sure user can edit this group
  if (groupId) {
    if (!community) return <div>No such group.</div>
    if (!membership.is_admin) return <div>You are not an administrator of this group.</div>
  }
  
  return (
    <React.Fragment>
      <Form onSubmit={ handleFormSubmit }>
        <FormFieldErrors errors={ nonFieldErrors } />
        <FormFieldErrors errors={ deleteErrors } />
        <FormHeader text={ community ? 'Edit' : 'Create' } />
        <FormHelp text='Please fill in the form below and hit "save".' />
        <FormTextInput 
          labelText="Name:" 
          value={ name }
          onValueChange={ (e) => setName(e.target.value) }
          errors={ nameErrors }
        />
        <FormTextInput 
          labelText="Password:" 
          value={ password }
          onValueChange={ (e) => setPassword(e.target.value) }
          errors={ passwordErrors }
        />
        <FormCheckboxInput 
          labelText="Require approval of new members from group admins?"
          value={ approve }
          onValueChange={ (e) => setApprove(e.target.checked) }
          errors={ approveErrors }
        />
        <FormSubmitButton 
          text="Submit"
          disabled={ isFormLoading || isDeleteLoading }
        />
      </Form>
      { 
        groupId 
        ? <DeleteButton 
            text="Delete" 
            onClick={ handleDeleteWithConfirmation } 
            disabled={ isFormLoading || isDeleteLoading }
          />
        : null
      }
    </React.Fragment>
  )
}

export default EditGroupForm;