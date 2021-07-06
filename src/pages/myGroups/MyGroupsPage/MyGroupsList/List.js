import React from 'react';
import { useSelector } from 'react-redux';

import MyGroupsListItem from './ListItem';
import { selectMyMemberships } from 'state';

import './styles.scss';


const MyGroupsList = () => {

  const myMemberships = useSelector(selectMyMemberships);

  return (
    <ul className="groups">
      {
        myMemberships.length
        ? myMemberships.map(m => 
            <MyGroupsListItem 
              membership={ m } 
              key={ m.community.id.toString() }
            />
          )
        : <p>You are not a member of any group yet.</p>
      }
    </ul>
  )
}

export default MyGroupsList;