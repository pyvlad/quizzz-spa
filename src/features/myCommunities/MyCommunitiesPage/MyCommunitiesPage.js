import React from 'react';

import MyCommunitiesList from './MyCommunitiesList/List';
import JoinCommunityLink from './JoinCommunityLink';
import CreateCommunityLink from './CreateCommunityLink';

import 'styles/grid.scss';
import 'styles/headings.scss';


const MyCommunitiesPage = () => (
  <div>
    <h2 className="heading heading--1">
      Groups
    </h2>
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-8">
          <MyCommunitiesList />
        </div>
        <div className="col-12 col-sm-offset-1 col-sm-3">
          <h3 className="heading heading--2">
            Manage Groups
          </h3>
          <div className="paper-md bg-grey p-2 px-sm-4 mb-4">
            <CreateCommunityLink />
          </div>
          <div className="paper-md bg-grey p-2 px-sm-4">
            <JoinCommunityLink />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default MyCommunitiesPage;