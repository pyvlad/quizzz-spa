import React from 'react';

import MyGroupsList from './MyGroupsList';
import JoinGroupLink from './JoinGroupLink';
import CreateGroupLink from './CreateGroupLink';


const MyGroupsPage = () => (
  <div>
    <h2 className="heading heading--1">
      Groups
    </h2>
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-8">
          <MyGroupsList />
        </div>
        <div className="col-12 col-sm-offset-1 col-sm-3">
          <h3 className="heading heading--2">
            Manage Groups
          </h3>
          <div className="paper-md bg-grey p-2 px-sm-4 mb-4">
            <CreateGroupLink />
          </div>
          <div className="paper-md bg-grey p-2 px-sm-4">
            <JoinGroupLink />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default MyGroupsPage;