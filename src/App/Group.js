/*
  This component renders correct group page 
  based on the url using relative paths.
*/
import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import GroupPage from 'pages/group/GroupPage';
import MembersPage from 'pages/group/MembersPage';
import MyQuizzesPage from 'pages/group/MyQuizzesPage';
import ChatPage from 'pages/group/ChatPage';
import TournamentsPage from 'pages/group/TournamentsPage';
import ActiveTournament from './containers/ActiveTournament';
import TournamentLoader from './containers/TournamentLoader';
import TournamentPages from './TournamentPages';
import { TournamentsNavbar, ActiveTournamentNavbar } from 'common/Navbar';


const Group = () => {

  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/`} component={ GroupPage }/>
      <Route exact path={`${path}/members/`} component={ MembersPage }/>
      <Route exact path={`${path}/my-quizzes/`} component={ MyQuizzesPage }/>
      <Route exact path={`${path}/chat/`} component={ ChatPage }/>
      <Route exact path={`${path}/tournaments/`} component={ TournamentsPage } />
      <Route path={`${path}/tournaments/:id`} render={
        ({match}) => (
          <ActiveTournament id={ parseInt(match.params.id) }>
            <TournamentLoader>
              <TournamentsNavbar/>
              <ActiveTournamentNavbar/>
              <TournamentPages/>
            </TournamentLoader>
          </ActiveTournament>
        )
      }/>
      <Redirect to={`${path}/`} />
    </Switch>
  )
}

export default Group;