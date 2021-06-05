import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import EditQuizForm from './EditQuizForm';
import * as api from 'api';


const EditQuiz = ({ quizId, handleDone }) => {

  const groupId = useSelector(selectActiveGroupId);

  // initial quiz data
  const [editedQuiz, setEditedQuiz] = React.useState(null);
  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getQuiz(groupId, quizId);
        setEditedQuiz(data);
      } catch(e) {
        console.log(e);
      }
    }
    if (quizId) fetchData();
  }, [groupId, quizId])

  
  return (quizId && !editedQuiz) 
    ? <div>Loading...</div>
    : <div>
        <button className="btn btn--primary" onClick={ handleDone }>
          Back
        </button>
        <EditQuizForm 
          quiz={ editedQuiz } 
          quizId={ quizId }
          groupId={ groupId} 
          handleDone={ handleDone } 
        />
      </div>
}

export default EditQuiz;