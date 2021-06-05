import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectActiveGroupId, selectMyGroupById } from 'state';
import urlFor from 'urls';


const GroupPage = () => {
  
  const groupId = useSelector(selectActiveGroupId);
  const { name, max_members } = useSelector(state => selectMyGroupById(state, groupId));

  return (
    <div>
      <div>
        This is { name }.
      </div>
      <div>
        <Link to={ urlFor("GROUP_MEMBERS", { groupId })}>
          Group Members (max={ max_members })
        </Link>
      </div>
      <div>
        <Link to={ urlFor("GROUP_MY_QUIZZES", { groupId })}>
          My Quizzes
        </Link>
      </div>
      <div>
        <Link to={ urlFor("GROUP_CHAT", { groupId })}>
          Chat
        </Link>
      </div>
    </div>
  )
}

export default GroupPage;