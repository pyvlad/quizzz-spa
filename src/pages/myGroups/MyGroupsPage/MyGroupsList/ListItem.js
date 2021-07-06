import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectCurrentUser, deleteMembership, showMessage } from 'state';
import urlFor from 'urls';
import * as api from 'api';
import useSubmit from 'common/useSubmit';
import Loading from 'common/Loading';

import './styles.scss';


const MyGroupsListItem = ({ membership }) => {

  // globals
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser.id;

  // props
  const { 
    is_admin: isGroupAdmin, 
    community: { 
      id: groupId,
      name
    } = {} 
  } = membership;
  
  // leave group submission state
  const { isLoading, handleSubmit } = useSubmit(
    async () => await api.deleteMembership(groupId, userId),
    () => {
      dispatch(showMessage('You have left that group.'));
      dispatch(deleteMembership(groupId));
    },
    false,
  )

  const handleLeaveWithConfirmation = (e) => {
    const confirmed = window.confirm("Are you sure you want to leave this group?")
    if (!confirmed) {
      return;
    } else {
      handleSubmit(e);
    }
  }

  // RENDERING
  return (
    <Loading isLoading={isLoading}>
      <li className="groups__li">
        <Link to={ urlFor("GROUP_HOME", {groupId}) } 
          className="groups__li-link groups__li-link--with-actions" 
        >
          { name }
        </Link>
        <div className="groups__li-actions">
          {
            isGroupAdmin
            ? <Link to={ urlFor("EDIT_GROUP", {groupId}) } 
                className="btn btn--grey btn--rounded" 
              >
                Edit
              </Link>
            : <button 
                onClick={ handleLeaveWithConfirmation } 
                className="btn btn--red btn--rounded"
              >
                Leave
              </button>
          }
        </div>
      </li>
    </Loading>
  )
}

export default MyGroupsListItem;