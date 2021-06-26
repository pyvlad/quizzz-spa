import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import useSubmit from 'common/useSubmit';
import FormFieldErrors from 'common/FormFieldErrors';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormCheckboxInput from 'common/FormCheckboxInput';
import FormTextInput from 'common/FormTextInput';


const EditTournamentForm = ({ tournament={}, onTournamentUpdate }) => {

  const groupId = useSelector(selectActiveGroupId);

  // INITIAL FORM DATA
  const { id, name: initialName, is_active } = tournament;

  // FORM STATE
  const [name, setName] = useState(initialName ? initialName : "");
  const [isActive, setIsActive] = useState(is_active ? is_active : false);
  
  // FORM SUBMISSION
  const { isLoading, errors, handleSubmit } = useSubmit(
    async () => {
      const payload = { name, is_active: isActive };
      return id 
        ? await api.updateTournament(groupId, id, payload)
        : await api.createTournament(groupId, payload);
    },
    tournamentObj => {
      onTournamentUpdate(tournamentObj);
    }
  )

  // FORM ERRORS
  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
    is_active: isActiveErrors,
  } = errors;


  // RENDERING
  return (
    <Form>
      <FormFieldErrors errors={ nonFieldErrors } />
      <FormHeader text={ id ? "Edit Tournament" : "New Tournament" } />
      <FormHelp text="Please fill in the form below and hit 'save'"/>
      <FormTextInput 
        labelText="Tournament Name:"
        value={ name } 
        onValueChange={ (e) => setName(e.target.value) } 
        errors={ nameErrors }
      />
      <FormCheckboxInput 
        labelText="Show tournament as active?"
        value={ isActive }
        onValueChange={ (e) => setIsActive(e.target.checked) }
        errors={ isActiveErrors }  
      />
      <div className='form__item'>
        <button 
          className="btn btn--secondary btn--block" 
          onClick={ handleSubmit }
          disabled={ isLoading }
        >
          Submit
        </button>
      </div>
    </Form>
  )
}

export default EditTournamentForm;