import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import MyCommunitiesLoader from 'pages/myCommunities/MyCommunitiesLoader';
import MyCommunitiesPage from 'pages/myCommunities/MyCommunitiesPage/MyCommunitiesPage';
import JoinCommunityPage from 'pages/myCommunities/JoinCommunityPage';
import CreateOrEditCommunityPage from 'pages/myCommunities/CreateOrEditCommunityPage';
import Community, { ActiveCommunity } from './Community';


const MyCommunities = () => (
  <MyCommunitiesLoader>
    <Switch>
      <Route exact path="/" component={ MyCommunitiesPage } />
      <Route exact path="/join-community/" component={ JoinCommunityPage } />
      <Route exact path="/create-community/" component={ CreateOrEditCommunityPage } />
      <Route exact path='/edit-community/:id/' render={
        ({match}) => <CreateOrEditCommunityPage communityId={ parseInt(match.params.id) } />
      }/>
      
      <Route path="/community/:id" render={
        ({match}) => (
          <ActiveCommunity id={ parseInt(match.params.id) }>
            <Community /> 
          </ActiveCommunity>
        )
      }/>

      <Redirect to="/" />
    </Switch>
  </MyCommunitiesLoader>
)

export default MyCommunities;