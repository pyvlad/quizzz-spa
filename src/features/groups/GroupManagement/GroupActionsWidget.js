import React from 'react';

import GroupCreateForm from './GroupCreateForm';
import GroupJoinForm from './GroupJoinForm';
import 'styles/paper.scss';
import 'styles/bg.scss';
import 'styles/spacing.scss';
import 'styles/headings.scss';


const GroupActionsWidget = ({ canCreateGroups }) => (
  <React.Fragment>
    <h3 className="heading heading--2">
      Manage Groups
    </h3>
    {
      canCreateGroups 
      ? <div className="paper-md bg-grey p-2 px-sm-4 mb-4">
          <GroupCreateForm />
        </div>
      : null
    }
    <div className="paper-md bg-grey p-2 px-sm-4">
      <GroupJoinForm />
    </div>
  </React.Fragment>
)

export default GroupActionsWidget;