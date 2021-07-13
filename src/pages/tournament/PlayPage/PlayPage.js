import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import PlayForm from './PlayForm';
import FormFieldErrors from 'common/FormFieldErrors';
import { useGroupPageTitle } from 'common/useTitle';


const PlayPage = ({ roundId }) => {

  const groupId = useSelector(selectActiveGroupId);
  const [quiz, setQuiz] = React.useState(null);
  const [errors, setErrors] = React.useState([]);

  useGroupPageTitle(groupId, `Play Round ${roundId}`);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setQuiz(await api.startRound(groupId, roundId));
      } catch(e) {
        console.log(e)
        setErrors(e.body ? [e.body] : [e.toString()])
      }
    }
    fetchData();
  }, [groupId, roundId, setQuiz])

  return (
    <div className="paper-lg bg-grey p-2 p-sm-4">
      <FormFieldErrors errors={ errors } />
      {
        quiz
        ? <PlayForm quiz={quiz} groupId={groupId} roundId={roundId} />
        : "Please, wait..."
      }
    </div>
  )
}

export default PlayPage;