import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchJoinGroupThunk, selectUserGroupsLoading } from '../groupsSlice';
import 'styles/form.scss';
import 'styles/btn.scss';
import 'styles/text.scss';


const GroupJoinForm = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserGroupsLoading);

  const [name, onNameChange] = useFormInput("");
  const [password, onPasswordChange] = useFormInput("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchJoinGroupThunk({ name, password }));
  }

  return (
    <form onSubmit={ handleSubmit } className="form">
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
        <label className="form__label" htmlFor="groupNameInput">
          Name:
        </label>
        <input 
          type="text" 
          name="name" 
          value={ name } 
          onChange={ onNameChange }
          className="form__input"
          id="groupNameInput"
        />
      </div>
      <div className="form__item">
        <label className="form__label" htmlFor="groupPasswordInput">
          Password:
        </label>
        <input 
          type="text" 
          name="password" 
          value={ password } 
          onChange={ onPasswordChange }
          className="form__input"
          id="groupPasswordInput"
        />
      </div>
      <div className="form__item text-centered">
        <input 
          type="submit"
          value="Join"
          className="btn btn--primary btn--block"
          disabled={isLoading}
        />
      </div>
    </form>
  )
}

function useFormInput(initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const handleChange = (e) => setValue(e.target.value);
  return [value, handleChange];
}

export default GroupJoinForm;