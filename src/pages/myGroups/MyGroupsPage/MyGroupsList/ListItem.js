import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import useSubmit from 'common/useSubmit';
import { selectCurrentUser, deleteMembership } from 'state';
import urlFor from 'urls';
import * as api from 'api';

import './styles.scss';


const MyGroupsListItem = ({ membership }) => {

  // tools
  const dispatch = useDispatch();

  // INITIAL DATA
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser.id;
  const { 
    is_admin: isGroupAdmin, 
    community: { 
      id: groupId,
      name
    } = {} 
  } = membership;
  
  // LEAVE SUBMISSION HANDLING
  const { handleSubmit } = useSubmit(
    async () => await api.deleteMembership(groupId, userId),
    () => dispatch(deleteMembership(groupId))
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
  )
}

export default MyGroupsListItem;