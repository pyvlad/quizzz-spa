import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import ReviewForm from './ReviewForm';
import FormFieldErrors from 'common/FormFieldErrors';
import { useGroupPageTitle } from 'common/useTitle';


const ReviewPage = ({ roundId }) => {

  const groupId = useSelector(selectActiveGroupId);
  useGroupPageTitle(groupId, `Review Round ${roundId}`);

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