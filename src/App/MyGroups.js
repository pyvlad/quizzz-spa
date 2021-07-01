/*
  This component renders correct page for an authenticated user.
*/
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import MyGroupsLoader from './containers/MyGroupsLoader';
import ActiveGroup from './containers/ActiveGroup';

import MyGroupsPage from 'pages/myGroups/MyGroupsPage';
import EditGroupPage from 'pages/myGroups/EditGroupPage';
import JoinGroupPage from 'pages/myGroups/JoinGroupPage';

import Group from './Group';


const MyGroups = () => (
  <MyGroupsLoader>
    <Switch>
      <Route exact path="/" component={ MyGroupsPage } />
      <Route exact path="/join-group/" component={ JoinGroupPage } />
      <Route exact path="/create-group/" component={ EditGroupPage } />
      <Route exact path='/edit-group/:id/' render={
        ({match}) => <EditGroupPage groupId={ parseInt(match.params.id) } />
      }/>
      <Route path="/group/:id" render={
        ({match}) => (
          <ActiveGroup id={ parseInt(match.params.id) }>
            <Group /> 
          </ActiveGroup>
        )
      }/>
      <Redirect to="/" />
    </Switch>
  </MyGroupsLoader>
)

export default MyGroups;