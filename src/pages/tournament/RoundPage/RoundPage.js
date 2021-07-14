import React from 'react';
import * as api from 'api';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId, selectCurrentUser } from 'state';
import RoundTable from './RoundTable';
import StandingsTable from './StandingsTable';
import { useFetch } from 'common/useFetch';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import urlFor from 'urls';


const RoundPage = ({ roundId }) => {

  // page parameters
  const user = useSelector(selectCurrentUser);
  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);

  // page title
  useGroupPageTitle(groupId, `Round ${roundId}`);

  // page navbar item
  const getItem = React.useCallback(() => ({
    text: `Round ${roundId}`,
    url: urlFor("ROUND", {groupId, tournamentId, roundId}), 
    isName: true
  }), [groupId, tournamentId, roundId]);
  useNavbarItem(getItem);

  // fetch round and standings data on page component mount
  const fetchFunc = React.useCallback(
    async () => await api.getRound(groupId, roundId), 
    [groupId, roundId]
  )
  const [{round, standings}] = useFetch(fetchFunc, {});

  // return component with `round === undefined` being a proxy for loading state
  return (round === undefined) 
    ? "Please, wait..."
    : <div>
        <h2 className="heading heading--1">
          Round Page
        </h2>
        <RoundTable round={round} groupId={groupId} />
        <section className="my-4">
          {
            standings.length
            ? <StandingsTable standings={standings} userId={user.id} />
            : <p>No one has taken this quiz yet.</p>
          }
          <br/>
          <p>As the author of this quiz, <strong>{ round.quiz.user.username } </strong>
             earns { standings.length } point(s).</p>
        </section>
      </div>
}

export default RoundPage;