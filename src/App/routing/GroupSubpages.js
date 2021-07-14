/*
  This component renders correct group page 
  based on the url using relative paths.

  Assumes that list of user groups has been loaded 
  and added to Redux store.
*/
import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import GroupPage from 'pages/group/GroupPage';
import MembersPage from 'pages/group/MembersPage';
import MyQuizzesPage from 'pages/group/MyQuizzesPage';
import ChatPage from 'pages/group/ChatPage';
import TournamentsPage from 'pages/group/TournamentsPage';
import { ActiveGroupNavbar } from 'common/Navbar';

import ActiveGroup from '../containers/ActiveGroup';
import TournamentSubpages from './TournamentSubpages';


const GroupSubpages = ({ urlGroupId }) => {

  let { path } = useRouteMatch();

  return (
    <ActiveGroup urlGroupId={urlGroupId}>
      <ActiveGroupNavbar />
      <Switch>
        <Route exact path={`${path}/`} component={ GroupPage }/>
        <Route exact path={`${path}/members/`} component={ MembersPage }/>
        <Route exact path={`${path}/my-quizzes/`} component={ MyQuizzesPage }/>
        <Route exact path={`${path}/chat/`} component={ ChatPage }/>
        <Route exact path={`${path}/tournaments/`} component={ TournamentsPage } />
        <Route path={`${path}/tournaments/:tournamentId`} render={
          ({match}) => <TournamentSubpages urlTournamentId={ parseInt(match.params.tournamentId) } />
        }/>
        <Redirect to={`${path}/`} />
      </Switch>
    </ActiveGroup>
  )
}

export default GroupSubpages;