import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import FormFieldErrors from 'features/common/FormFieldErrors';
import { fetchCreateCommunity, fetchEditCommunity, fetchDeleteCommunity } from 'api';
import { 
  addMembership, 
  deleteMembership, 
  updateCommunity, 
  selectMyMembershipByCommunityId, 
} from '../slice';
import 'styles/form.scss';
import 'styles/btn.scss';
import 'styles/text.scss';



const CreateCommunityForm = ({ communityId }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const membership = useSelector(state => selectMyMembershipByCommunityId(state, communityId));
  const community = membership ? membership.community : null;

  const [name, setName] = useState(community ? community.name : "");
  const [password, setPassword] = useState(community ? community.password : "");
  const [approve, setApprove] = useState(community ? community.approval_required : false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // make sure user can edit this group
  if (communityId) {
    if (!community) return <div>No such community.</div>
    if (!membership.is_admin) return <div>You are not an administrator of this group.</div>
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;
      const payload = { name, password, approval_required: approve }

      try {
        if (community) {
          const updatedCommunity = await fetchEditCommunity(communityId, payload);
          dispatch(updateCommunity(updatedCommunity));
        } else {
          const membership = await fetchCreateCommunity(payload);
          dispatch(addMembership(membership));
        }
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

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!isLoading) {

      const confirmed = window.confirm("Are you sure you want to delete this group?")
      if (!confirmed) return;

      setErrors({});
      setIsLoading(true);
      let success = false;

      try {
        await fetchDeleteCommunity(communityId);
        dispatch(deleteMembership(communityId));
        success = true;
      } catch(err) {
        setErrors({non_field_errors: [err.message]});
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
    approval_required: approveErrors,
  } = errors;
  
  return (
    <React.Fragment>
      <form onSubmit={ handleSubmit } className="form">
        <FormFieldErrors errors={ nonFieldErrors } />
        <div className="form__header">
          { community ? 'Edit' : 'Create' }
        </div>
        <div className="form__item">
          <div className="form__help">
            Please fill in the form below and hit 'save'.<br/>
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
        <div className='form__item'>
          <input 
            type="checkbox" 
            checked={ approve } 
            onChange={ (e) => setApprove(e.target.checked) }
            className="form__input"
            id="communityApprovalRequiredInput"
          />
          <label htmlFor="communityApprovalRequiredInput">
            Require approval of new members from group admins?
          </label>
          <FormFieldErrors errors={ approveErrors } />
        </div>
        <div className="form__item text-centered">
          <input 
            type="submit"
            value="Submit"
            className="btn btn--primary btn--block"
            disabled={ isLoading }
          />
        </div>
      </form>
      { communityId 
        ? <div className='form__item'>
            <button 
              className="btn btn--red btn--block"
              onClick={ handleDelete }
            >
              Delete
            </button>
          </div>
        : null
      }
    </React.Fragment>
  )
}


export default CreateCommunityForm;