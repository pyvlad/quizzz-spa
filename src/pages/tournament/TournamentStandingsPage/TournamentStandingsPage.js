import React from 'react';
import * as api from 'api';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId, selectCurrentUser } from 'state';
import urlFor from 'urls';
import StandingsTable from './StandingsTable';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';


const TournamentStandingsPage = () => {

  const user = useSelector(selectCurrentUser);
  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);
  const [standings, setStandings] = React.useState(null);

  useGroupPageTitle(groupId, "Tournament Standings");
  const getItem = React.useCallback(() => ({
    text: "Standings", 
    url: urlFor("TOURNAMENT_STANDINGS", {groupId, tournamentId}), 
    isName: false
  }), [groupId, tournamentId]);
  useNavbarItem(getItem);

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