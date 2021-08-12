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
  showMessage,
} from 'state';

import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormCheckboxInput from 'common/FormCheckboxInput';
import FormSubmitButton from 'common/FormSubmitButton';
import { useSubmit } from 'common/useApi';

import DeleteGroupButton from './DeleteGroupButton';



const EditGroupForm = ({ groupId }) => {
  
  // globals
  const dispatch = useDispatch();
  const history = useHistory();

  // initial form data
  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const community = membership ? membership.community : null;

  // local form state
  const [name, setName] = useState(community ? community.name : "");
  const [password, setPassword] = useState(community ? community.password : "");
  const [approve, setApprove] = useState(community ? community.approval_required : false);
  
  // submission state
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => {
      const payload = { name, password, approval_required: approve };
      const result = (community) 
        ? await api.updateCommunity(groupId, payload) // 'updatedCommunity'
        : await api.createCommunity(payload)          // 'membership'
      return result;
    },
    result => {
      dispatch(showMessage(community ? 'Group updated.' : "Group created.", 'info'))
      dispatch(community ? updateGroup(result) : addMembership(result));
      history.push(urlFor('MY_GROUPS'))
    }
  )

  // errors
  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
    password: passwordErrors,
    approval_required: approveErrors,
  } = formErrors || {};

  // handler for the delete button
  const onGroupDelete = () => {
    dispatch(deleteMembership(groupId));
    dispatch(showMessage('Group deleted.', 'info'));
    history.push(urlFor('MY_GROUPS'));
  }

  // rendering
  // make sure user can edit this group
  if (groupId) {
    if (!community) return <div>No such group.</div>
    if (!membership.is_admin) return <div>You are not an administrator of this group.</div>
  }

  return (
    <React.Fragment>
      <Form onSubmit={ handleSubmit }>
        <FormFieldErrors errors={ nonFieldErrors } />
        <FormHeader text={ community ? 'Edit Group' : 'Create Group' } />
        <FormHelp text='Please fill in the form below and submit.' />
        <FormTextInput 
          labelText="Name:" 
          value={ name }
          onValueChange={ (e) => setName(e.target.value) }
          errors={ nameErrors }
          helpText="This field is required and must be unique across the website."
        />
        <FormTextInput 
          labelText="Password:" 
          value={ password }
          onValueChange={ (e) => setPassword(e.target.value) }
          errors={ passwordErrors }
          helpText={`
            Password is optional - use it if you want to prevent strangers 
            from joining in by guessing the group name.
          `}
        />
        <FormCheckboxInput 
          labelText="Require approval of new members by group admin?"
          value={ approve }
          onValueChange={ (e) => setApprove(e.target.checked) }
          errors={ approveErrors }
          helpText={`
            If you select this option, no one will be able to join in 
            until manually approved by the group admin.
          `}
        />
        <FormSubmitButton 
          text="Submit"
          disabled={ isLoading }
        />
      </Form>
      { 
        groupId 
        ? <DeleteGroupButton 
            groupId={ groupId } 
            onGroupDelete={ onGroupDelete }
          />
        : null
      }
    </React.Fragment>
  )
}

export default EditGroupForm;