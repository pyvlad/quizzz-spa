import React from 'react';
import { useSelector } from 'react-redux';

import { selectAuthLoading, selectAuthError } from 'features/auth/authSlice';
import { selectUserGroupsLoading, selectUserGroupsError } from 'features/groups/groupsSlice';
import './Message.scss';


const Message = () => {
  const isAuthLoading = useSelector(selectAuthLoading);
  const isUserGroupsLoading = useSelector(selectUserGroupsLoading);
  const authError = useSelector(selectAuthError);
  const userGroupsError = useSelector(selectUserGroupsError);

  const msg = (isAuthLoading || isUserGroupsLoading)
    ? 'Please, wait...'
    : (authError || userGroupsError || "")

  return msg 
    ? <div className="flash-messages my-3">
        <div className="flash-messages__item flash-messages__item--error my-2 p-2">
          { msg }
        </div>
      </div>
    : null;
}

export default Message;