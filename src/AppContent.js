import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import MyCommunitiesLoader from 'features/myCommunities/MyCommunitiesLoader';
import MyCommunitiesPage from 'features/myCommunities/MyCommunitiesPage/MyCommunitiesPage';
import JoinCommunityPage from 'features/myCommunities/JoinCommunityPage';
import CreateOrEditCommunityPage from 'features/myCommunities/CreateOrEditCommunityPage';
import CommunityPage from 'features/community/CommunityPage';
import MembersPage from 'features/community/MembersPage';


const AppContent = () => (
  <MyCommunitiesLoader>
    <Switch>
      <Route exact path="/" component={ MyCommunitiesPage } />
      <Route exact path="/join-community/" component={ JoinCommunityPage } />
      <Route exact path="/create-community/" component={ CreateOrEditCommunityPage } />
      <Route exact path='/edit-community/:id/' render={
        ({match}) => <CreateOrEditCommunityPage communityId={ parseInt(match.params.id) } />
      }/>
      <Route exact path="/community/:id/" render={ 
        props => <CommunityPage communityId={ parseInt(props.match.params.id) } />
      }/>
      <Route exact path="/community/:id/members/" render={ 
        props => <MembersPage communityId={ parseInt(props.match.params.id) } />
      }/>
      <Redirect to="/" />
    </Switch>
  </MyCommunitiesLoader>
)

export default AppContent;