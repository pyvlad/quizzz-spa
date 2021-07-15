import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import * as api from 'api';
import urlFor from 'urls';
import { addMembership, showMessage } from 'state';

import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormFieldErrors from 'common/FormFieldErrors';
import FormTextInput from 'common/FormTextInput';
import FormSubmitButton from 'common/FormSubmitButton';
import { useSubmit } from 'common/useApi';


const JoinGroupForm = () => {

  // globals
  const dispatch = useDispatch();
  const history = useHistory();

  // local state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // submission state
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => await api.joinCommunity({ name, password }),
    membership => {
      dispatch(showMessage("New group joined.", "success"));
      dispatch(addMembership(membership));
      history.push(urlFor('MY_GROUPS'))
    }
  )

  // show errors
  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
    password: passwordErrors,
  } = formErrors || {};

  // return component
  return (
    <Form onSubmit={ handleSubmit }>
      <FormFieldErrors errors={ nonFieldErrors } />
      <FormHeader text="Join" />
      <FormHelp text="To join an existing group, enter group name and click submit. 
          Enter password if the group is password-protected." />
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
      <FormSubmitButton 
        text="Join"
        disabled={ isLoading }
      />
    </Form>
  )
}

export default JoinGroupForm;