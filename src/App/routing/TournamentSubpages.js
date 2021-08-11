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
import RoundChatPage from 'pages/tournament/RoundChatPage';
import { TournamentsNavbar, ActiveTournamentNavbar } from 'common/Navbar';

import ActiveTournament from '../containers/ActiveTournament';
import TournamentLoader from '../containers/TournamentLoader';


const TournamentSubpages = ({ urlTournamentId }) => {

  let { path } = useRouteMatch();

  return (
    <ActiveTournament urlTournamentId={ urlTournamentId }>
      <TournamentsNavbar/>
      <TournamentLoader>
        <ActiveTournamentNavbar/>
        <Switch>
          <Route exact path={`${path}/rounds/`} component={ TournamentRoundsPage } />
          <Route exact path={`${path}/standings/`} component={ TournamentStandingsPage } />
          <Route exact path={`${path}/rounds/:roundId/`} 
            render={ ({match}) => <RoundPage roundId={ parseInt(match.params.roundId) } /> }
          />
          <Route exact path={`${path}/rounds/:roundId/play/`} 
            render={ ({match}) => <PlayPage roundId={ parseInt(match.params.roundId) } /> }
          />
          <Route exact path={`${path}/rounds/:roundId/review/`} 
            render={ ({match}) => <ReviewPage roundId={ parseInt(match.params.roundId) } /> }
          />
          <Route exact path={`${path}/rounds/:roundId/discuss/`} 
            render={ ({match}) => <RoundChatPage roundId={ parseInt(match.params.roundId) } /> }
          />
          <Redirect to={`${path}/rounds/`} />
        </Switch>
      </TournamentLoader>
    </ActiveTournament>
  )
}

export default TournamentSubpages;