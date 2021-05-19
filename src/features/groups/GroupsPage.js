import React from 'react';

import GroupList from './GroupList/GroupList';
import GroupActionsWidget from './GroupManagement/GroupActionsWidget';
import 'styles/grid.scss';
import 'styles/headings.scss';


const GroupsPage = () => {
  return <div>
    <h2 className="heading heading--1">
      Groups
    </h2>
    <p></p>
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-8">
          <GroupList />
        </div>
        <div className="col-12 col-sm-offset-1 col-sm-3">
          <GroupActionsWidget canCreateGroups={ true } />
        </div>
      </div>
    </div>
  </div>
}

export default GroupsPage;