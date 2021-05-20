import React from 'react';
import { useSelector } from 'react-redux';

import MyCommunitiesListItem from './ListItem';
import { selectMyMemberships, selectMyCommunitiesLoading } from '../slice';
import 'styles/headings.scss';
import 'styles/paper.scss';
import 'styles/spacing.scss';
import './styles.scss';


const MyCommunitiesList = () => {
  const myMemberships = useSelector(selectMyMemberships);
  const isLoading = useSelector(selectMyCommunitiesLoading);

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
                    <MyCommunitiesListItem 
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

export default MyCommunitiesList;