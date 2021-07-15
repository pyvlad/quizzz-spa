import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import PlayForm from './PlayForm';
import { useGroupPageTitle } from 'common/useTitle';
import { useSubmit } from 'common/useApi';


const PlayPage = ({ roundId }) => {

  // page parameters
  const groupId = useSelector(selectActiveGroupId);

  // page title
  useGroupPageTitle(groupId, `Play Round ${roundId}`);

  // load quiz on component mount
  const [quiz, setQuiz] = React.useState(null);

  const apiFunc = React.useCallback(
    async () => await api.startRound(groupId, roundId), 
    [groupId, roundId]
  );
  const { isLoading, fetchFunc } = useSubmit(apiFunc, null, false);
  React.useEffect(() => {
    (async () => {
      const { responseData, success } = await fetchFunc();
      if (success) setQuiz(responseData);
    })();
  }, [fetchFunc, setQuiz]);

  // return component
  return (
    <div className="paper-lg bg-grey p-2 p-sm-4">
      {
        isLoading
        ? "Please, wait..."
        : (quiz 
           ? <PlayForm quiz={quiz} groupId={groupId} roundId={roundId} /> 
           : "Not available."
          )
      }
    </div>
  )
}

export default PlayPage;