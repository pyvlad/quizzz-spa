import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId } from 'state';

import * as api from 'api';
import urlFor from 'urls';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import useSubmit from 'common/useSubmit';

import ReviewForm from './ReviewForm';


const ReviewPage = ({ roundId }) => {

  // page parameters
  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);

  // page title
  useGroupPageTitle(groupId, `Review Round ${roundId}`);

  // page navbar item
  const getItem = React.useCallback(() => ({
    text: `Round ${roundId}`,
    url: urlFor("ROUND", {groupId, tournamentId, roundId}), 
    isName: true
  }), [groupId, tournamentId, roundId]);
  useNavbarItem(getItem);

  // load quiz data on component mount
  const [data, setData] = React.useState(null);

  const apiFunc = React.useCallback(
    async () => await api.reviewRound(groupId, roundId), 
    [groupId, roundId]
  );
  const { isLoading, fetchFunc } = useSubmit(apiFunc, null, false);
  React.useEffect(() => {
    (async () => {
      const { responseData, success } = await fetchFunc();
      if (success) setData(responseData);
    })();
  }, [fetchFunc, setData]);

  // return component
  return (
    <div className="paper-lg bg-grey p-2 p-sm-4">
      {
        isLoading
        ? "Please, wait..."
        : (data 
           ? <ReviewForm data={data} groupId={groupId} roundId={roundId} /> 
           : "Not available."
          )
      }
    </div>
  )
}

export default ReviewPage;