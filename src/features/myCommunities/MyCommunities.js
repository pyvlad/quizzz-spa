import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMyMemberships, selectMyCommunitiesStatus } from './slice';
import Content from './Content';
import JoinCommunityLink from './links/JoinCommunityLink';
import CreateCommunityLink from './links/CreateCommunityLink';

import 'styles/grid.scss';
import 'styles/headings.scss';


const MyCommunities = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectMyCommunitiesStatus);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMyMemberships())
    }
  }, [dispatch, status]);


  let content = "";
  if (status === 'idle' || status === 'loading') {
    content = 'Please, wait...'
  } else if (status === "failed") {
    content = 'Could not load the data. Please try again later.'
  } else {
    content = <Content />
  }

  return <div>
    <h2 className="heading heading--1">
      Groups
    </h2>
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-8">
          { content }
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
}

export default MyCommunities;