import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import GroupItem from './GroupItem';
import { 
  fetchUserGroupsThunk, 
  selectUserGroups, 
  selectUserGroupsLoading,
} from '../groupsSlice';
import 'styles/headings.scss';
import 'styles/paper.scss';
import 'styles/spacing.scss';
import './groups.scss';


const GroupList = () => {
  const dispatch = useDispatch();
  const userGroups = useSelector(selectUserGroups);
  const isLoading = useSelector(selectUserGroupsLoading);

  React.useEffect(() => {
    dispatch(fetchUserGroupsThunk())
  }, [dispatch]);

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
                userGroups.length
                ? userGroups.map(g => <GroupItem group={g} key={g.id} />)
                : <p>You are not a member of any group yet.</p>
              }
            </ul>
        }
      </div>
    </React.Fragment>
  )
}

export default GroupList;