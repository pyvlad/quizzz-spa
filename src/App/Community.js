import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import CommunityPage from 'pages/community/CommunityPage';
import MembersPage from 'pages/community/MembersPage';
import MyQuizzesPage from 'pages/community/MyQuizzesPage';
import ChatPage from 'pages/community/ChatPage';


const Community = ({ id }) => {

  let { path } = useRouteMatch();
  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.

  return (
    <Switch>
      <Route exact path={`${path}/`} render={ 
        props => <CommunityPage communityId={ id } />
      }/>
      <Route exact path={`${path}/members/`} render={ 
        props => <MembersPage communityId={ id } />
      }/>
      <Route exact path={`${path}/my-quizzes/`} render={
        props => <MyQuizzesPage communityId={ id } />
      }/>
      <Route exact path={`${path}/chat/`} render={
        props => <ChatPage communityId={ id } />
      }/>
      <Redirect to={`${path}/`} />
    </Switch>
  )
}

export default Community;