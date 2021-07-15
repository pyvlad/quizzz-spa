/*
  This component renders correct page for an authenticated user.
*/
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import MyGroupsPage from 'pages/myGroups/MyGroupsPage';
import EditGroupPage from 'pages/myGroups/EditGroupPage';
import JoinGroupPage from 'pages/myGroups/JoinGroupPage';
import { GroupsNavbar } from 'common/Navbar';

import MyGroupsLoader from '../containers/MyGroupsLoader';
import GroupSubpages from './GroupSubpages';


const UserPages = () => (
  <MyGroupsLoader>
    <GroupsNavbar/>
    <Switch>
      <Route exact path="/" component={ MyGroupsPage } />
      <Route exact path="/join-group/" component={ JoinGroupPage } />
      <Route exact path="/create-group/" component={ EditGroupPage } />
      <Route exact path='/edit-group/:groupId/' render={
        ({match}) => <EditGroupPage groupId={ parseInt(match.params.groupId) } />
      }/>
      <Route path="/group/:groupId" render={
        ({match}) => <GroupSubpages urlGroupId={ parseInt(match.params.groupId)} />
      }/>
      <Redirect to="/" />
    </Switch>
  </MyGroupsLoader>
)

export default UserPages;