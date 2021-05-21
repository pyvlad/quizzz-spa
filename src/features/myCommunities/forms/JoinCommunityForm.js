import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import FormFieldErrors from './FormFieldErrors';
import { addMembership } from '../slice';
import { fetchJoinCommunity } from 'api';
import 'styles/form.scss';
import 'styles/btn.scss';
import 'styles/text.scss';



const JoinCommunityForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;
      
      try {
        const membership = await fetchJoinCommunity({ name, password });
        dispatch(addMembership(membership));
        success = true;
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        history.push('/');
      }
    }
  }

  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
    password: passwordErrors,
  } = errors;

  return (
    <form onSubmit={ handleSubmit } className="form">
      <FormFieldErrors errors={ nonFieldErrors } />
      <div className="form__header">
        Join
      </div>
      <div className="form__item">
        <div className="form__help">
          To join an existing group, enter group name and click submit. 
          Enter password if the group is password-protected.
        </div>
      </div>
      <div className="form__item">
        <label className="form__label" htmlFor="communityNameInput">
          Name:
        </label>
        <input 
          type="text" 
          value={ name } 
          onChange={ (e) => setName(e.target.value) }
          className="form__input"
          id="communityNameInput"
        />
        <FormFieldErrors errors={ nameErrors } />
      </div>
      <div className="form__item">
        <label className="form__label" htmlFor="communityPasswordInput">
          Password:
        </label>
        <input 
          type="text" 
          value={ password } 
          onChange={ (e) => setPassword(e.target.value) }
          className="form__input"
          id="communityPasswordInput"
        />
        <FormFieldErrors errors={ passwordErrors } />
      </div>
      <div className="form__item text-centered">
        <input 
          type="submit"
          value="Join"
          className="btn btn--primary btn--block"
          disabled={ isLoading }
        />
      </div>
    </form>
  )
}


export default JoinCommunityForm;