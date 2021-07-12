import React from 'react';
import * as api from 'api';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectCurrentUser } from 'state';
import RoundTable from './RoundTable';
import StandingsTable from './StandingsTable';
import { useGroupPageTitle } from 'common/useTitle';


const RoundPage = ({ roundId }) => {

  const user = useSelector(selectCurrentUser);
  const groupId = useSelector(selectActiveGroupId);
  const [round, setRound] = React.useState(null);
  const [standings, setStandings] = React.useState([]);

  useGroupPageTitle(groupId, `Round ${roundId}`);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getRound(groupId, roundId);
        setStandings(data["standings"]);
        setRound(data["round"]);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [groupId, roundId, setRound])

  return (round === null) 
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