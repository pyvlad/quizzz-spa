import React from 'react';
import * as api from 'api';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectCurrentUser } from 'state';
import StandingsTable from './StandingsTable';


const TournamentStandingsPage = ({ tournamentId }) => {

  const user = useSelector(selectCurrentUser);
  const groupId = useSelector(selectActiveGroupId);
  const [standings, setStandings] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setStandings(await api.getTournamentStandings(groupId, tournamentId));
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [groupId, tournamentId, setStandings])

  return (standings === null) 
    ? "Please, wait..."
    : <div>
        <h2 className="heading heading--1">
          Tournament Standings Page
        </h2>
        {
          standings.length
          ? <StandingsTable standings={standings} userId={user.id} />
          : <p>No standings are available yet.</p>
        }
      </div>
}

export default TournamentStandingsPage;