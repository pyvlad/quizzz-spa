import React from 'react';
import * as api from 'api';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId, 
  selectCurrentUser, selectTournament } from 'state';
import urlFor from 'urls';
import StandingsTable from './StandingsTable';
import { useFetchedListOfItems } from 'common/useApi';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';


const TournamentStandingsPage = () => {

  // page parameters
  const user = useSelector(selectCurrentUser);
  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);
  const tournamentName = useSelector(selectTournament).name;

  // page title
  useGroupPageTitle(groupId, "Tournament Standings");

  // page navbar item
  const getItem = React.useCallback(() => ({
    text: "Standings", 
    url: urlFor("TOURNAMENT_STANDINGS", {groupId, tournamentId}), 
    isName: false
  }), [groupId, tournamentId]);
  useNavbarItem(getItem);

  // fetch array of rows on page component mount
  const fetchFunc = React.useCallback(
    async () => await api.getTournamentStandings(groupId, tournamentId), 
    [groupId, tournamentId]
  )
  const [standings] = useFetchedListOfItems(fetchFunc);

  // return component with `standings === null` being a proxy for loading state
  return (standings === null) 
    ? "Please, wait..."
    : <div>
        <h2 className="heading heading--1">
          Tournament: "{ tournamentName }"
        </h2>
        <h3 className="heading heading--2">
          Overall Standings
        </h3>
        {
          standings.length
          ? <StandingsTable standings={standings} userId={user.id} />
          : <p>No standings are available yet.</p>
        }
      </div>
}

export default TournamentStandingsPage;