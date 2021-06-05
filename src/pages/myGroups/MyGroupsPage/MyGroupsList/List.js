import React from 'react';
import { useSelector } from 'react-redux';

import MyGroupsListItem from './ListItem';
import { selectMyMemberships, selectMyGroupsLoading } from 'state';

import './styles.scss';


const MyGroupsList = () => {
  const myMemberships = useSelector(selectMyMemberships);
  const isLoading = useSelector(selectMyGroupsLoading);

  return (
    <React.Fragment>
      <h3 className="heading heading--2">
        Your Groups
      </h3>
      <div className="paper-md bg-grey p-2 px-sm-4 mb-4">
        {
          isLoading
          ? <p>Please wait...</p>
          : <ul className="groups">
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
        }
      </div>
    </React.Fragment>
  )
}

export default MyGroupsList;