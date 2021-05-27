import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import MyCommunitiesLoader from 'features/myCommunities/MyCommunitiesLoader';
import MyCommunitiesPage from 'features/myCommunities/MyCommunitiesPage/MyCommunitiesPage';
import JoinCommunityPage from 'features/myCommunities/JoinCommunityPage';
import CreateOrEditCommunityPage from 'features/myCommunities/CreateOrEditCommunityPage';
import CommunityPage from 'features/community/CommunityPage';


const AppContent = () => (
  <MyCommunitiesLoader>
    <Switch>
      <Route exact path="/" component={ MyCommunitiesPage } />
      <Route exact path="/join-community/" component={ JoinCommunityPage } />
      <Route exact path="/create-community/" component={ CreateOrEditCommunityPage } />
      <Route exact path='/edit-community/:id/' 
        render={
          props => {
            const id = parseInt(props.match.params.id);
            return <CreateOrEditCommunityPage communityId={ id } />
          }
        }
      />
      <Route exact path="/community/:id/" 
        render={ 
          props => {
            const id = parseInt(props.match.params.id);
            return <CommunityPage communityId={ id } />
          }
        }
      />
      <Redirect to="/" />
    </Switch>
  </MyCommunitiesLoader>
)

export default AppContent;