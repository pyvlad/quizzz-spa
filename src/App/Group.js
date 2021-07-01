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
import RoundsPage from 'pages/group/RoundsPage';
import RoundPage from 'pages/group/RoundPage';
import PlayPage from 'pages/group/PlayPage';
import ReviewPage from 'pages/group/ReviewPage';
import TournamentStandingsPage from 'pages/group/TournamentStandingsPage';


const Group = () => {

  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/`} component={ GroupPage }/>
      <Route exact path={`${path}/members/`} component={ MembersPage }/>
      <Route exact path={`${path}/my-quizzes/`} component={ MyQuizzesPage }/>
      <Route exact path={`${path}/chat/`} component={ ChatPage }/>
      <Route exact path={`${path}/tournaments/`} component={ TournamentsPage } />
      <Route exact path={`${path}/tournaments/:id/rounds/`} 
        render={ ({match}) => <RoundsPage tournamentId={ parseInt(match.params.id) } /> }
      />
      <Route exact path={`${path}/tournaments/:id/standings/`} 
        render={ ({match}) => <TournamentStandingsPage tournamentId={ parseInt(match.params.id) } /> }
      />
      <Route exact path={`${path}/rounds/:id/`} 
        render={ ({match}) => <RoundPage roundId={ parseInt(match.params.id) } /> }
      />
      <Route exact path={`${path}/rounds/:id/play/`} 
        render={ ({match}) => <PlayPage roundId={ parseInt(match.params.id) } /> }
      />
      <Route exact path={`${path}/rounds/:id/review/`} 
        render={ ({match}) => <ReviewPage roundId={ parseInt(match.params.id) } /> }
      />
      <Redirect to={`${path}/`} />
    </Switch>
  )
}

export default Group;