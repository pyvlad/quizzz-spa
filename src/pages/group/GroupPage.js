import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectActiveGroupId, selectMyGroupById } from 'state';
import urlFor from 'urls';
import { useGroupPageTitle } from 'common/useTitle';


const GroupPage = () => {
  
  const groupId = useSelector(selectActiveGroupId);
  const { name, max_members } = useSelector(state => selectMyGroupById(state, groupId));
  
  useGroupPageTitle(groupId, "Group");

  return (
    <div>
      <h2 className="heading heading--1">
        Group: { name }
      </h2>
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-6 pr-sm-4">
            <LinkContainer 
              to={ urlFor("GROUP_TOURNAMENTS", { groupId })} 
              text="Tournaments" 
            />
            <LinkContainer 
              to={ urlFor("GROUP_CHAT", { groupId })}
              text="Chat" 
            />   
          </div>
          <div className="col-12 col-sm-6 pl-sm-4">
            <LinkContainer 
              to={ urlFor("GROUP_MY_QUIZZES", { groupId })}
              text="My Quizzes" 
            />
            <LinkContainer 
              to={ urlFor("GROUP_MEMBERS", { groupId })}
              text={`Group Members (max=${ max_members })`}
            />   
          </div>
        </div>
      </div>
    </div>
  )
}


const LinkContainer = ({ to, text }) => {
  return (
    <div className="paper p-4 mb-4">
      <h3 className="heading heading--2">
        <Link to={ to }>
          { text }
        </Link>
      </h3>
    </div>
  )
}


export default GroupPage;