/*
  This component renders correct tournament page 
  based on the url using relative paths.
*/
import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import TournamentRoundsPage from 'pages/tournament/TournamentRoundsPage';
import TournamentStandingsPage from 'pages/tournament/TournamentStandingsPage';
import RoundPage from 'pages/tournament/RoundPage';
import PlayPage from 'pages/tournament/PlayPage';
import ReviewPage from 'pages/tournament/ReviewPage';


const TournamentPages = () => {

  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/rounds/`} component={ TournamentRoundsPage } />
      <Route exact path={`${path}/standings/`} component={ TournamentStandingsPage } />
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

export default TournamentPages;