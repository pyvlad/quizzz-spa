import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchLeaveGroupThunk } from '../groupsSlice';
import { selectCurrentUser } from 'features/auth/authSlice';
import 'styles/btn.scss';
import './groups.scss';


const GroupItem = ({ groupMembership }) => {
  const { is_admin: isGroupAdmin, community: { name } = {} } = groupMembership;

  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleLeaveGroup = (e) => {
    e.preventDefault();
    dispatch(fetchLeaveGroupThunk({ 
      userId: user.id, 
      communityId: groupMembership.community.id 
    }));
  }

  return <li className="groups__li">
    <a className="groups__li-link groups__li-link--with-actions" 
       href="">
      { name }
    </a>
    <div className="groups__li-actions">
      {
        isGroupAdmin
        ? <a className="btn btn--grey btn--rounded" 
             href="">
            Edit
          </a>
        : <button className="btn btn--red btn--rounded" onClick={ handleLeaveGroup } >
            Leave
          </button>
      }
    </div>
  </li>
}

export default GroupItem;