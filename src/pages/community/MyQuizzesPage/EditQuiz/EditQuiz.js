import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveCommunityId } from 'state/communitySlice';

import EditQuizForm from './EditQuizForm';
import { fetchQuiz } from 'api';


const EditQuiz = ({ quizId, handleDone }) => {

  const communityId = useSelector(selectActiveCommunityId);
  const [editedQuiz, setEditedQuiz] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchQuiz(communityId, quizId);
        setEditedQuiz(data);
      } catch(e) {
        console.log(e);
      }
    }
    if (quizId) fetchData();
  }, [communityId, quizId])

  return (quizId && !editedQuiz) 
    ? <div>Loading...</div>
    : <div>
        <button className="btn btn--primary" onClick={ handleDone }>
          Back
        </button>
        <EditQuizForm 
          quiz={ editedQuiz } 
          quizId={ quizId }
          communityId={ communityId} 
          handleDone={ handleDone } 
        />
      </div>
}

export default EditQuiz;