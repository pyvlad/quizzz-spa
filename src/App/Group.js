import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import GroupPage from 'pages/group/GroupPage';
import MembersPage from 'pages/group/MembersPage';
import MyQuizzesPage from 'pages/group/MyQuizzesPage';
import ChatPage from 'pages/group/ChatPage';


const Group = () => {
  /*
    This component renders correct page based on the url using relative paths.
  */
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/`} component={ GroupPage }/>
      <Route exact path={`${path}/members/`} component={ MembersPage }/>
      <Route exact path={`${path}/my-quizzes/`} component={ MyQuizzesPage }/>
      <Route exact path={`${path}/chat/`} component={ ChatPage }/>
      <Redirect to={`${path}/`} />
    </Switch>
  )
}

export default Group;