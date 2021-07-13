import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId } from 'state';

import * as api from 'api';
import urlFor from 'urls';

import ReviewForm from './ReviewForm';
import FormFieldErrors from 'common/FormFieldErrors';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';


const ReviewPage = ({ roundId }) => {

  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);

  useGroupPageTitle(groupId, `Review Round ${roundId}`);

  const getItem = React.useCallback(() => ({
    text: `Round ${roundId}`,
    url: urlFor("ROUND", {groupId, tournamentId, roundId}), 
    isName: true
  }), [groupId, tournamentId, roundId]);
  useNavbarItem(getItem);

  const [data, setData] = React.useState(null);
  const [errors, setErrors] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setData(await api.reviewRound(groupId, roundId));
      } catch(e) {
        console.log(e)
        setErrors(e.message ? [e.message] : [])
      }
    }
    fetchData();
  }, [groupId, roundId, setData])


  return (
    <div className="paper-lg bg-grey p-2 p-sm-4">
      <FormFieldErrors errors={ errors } />
      {
        data
        ? <ReviewForm data={data} groupId={groupId} roundId={roundId} />
        : "Please, wait..."
      }
    </div>
  )
}

export default ReviewPage;