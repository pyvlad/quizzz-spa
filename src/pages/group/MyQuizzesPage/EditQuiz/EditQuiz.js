import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import EditQuizForm from './EditQuizForm';
import * as api from 'api';



const EditQuiz = ({ quizId, handleDone }) => {

  const groupId = useSelector(selectActiveGroupId);

  // initial quiz data
  const [editedQuiz, setEditedQuiz] = React.useState(null);
  const [updating, setUpdating] = React.useState(false);

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


  const onFetchQuizFromOpenTriviaDB = async (e) => {
    e.preventDefault();

    setUpdating(true);
    setEditedQuiz(await api.fetchQuestionsFromOpenTriviaDB(editedQuiz));
    setUpdating(false); 
  }

  return ((quizId && !editedQuiz) || (updating))
    ? <div>Loading...</div>
    : <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button className="btn btn--primary" onClick={ handleDone }>
            Back
          </button>
          { 
            editedQuiz 
            ? <button 
                className="btn btn--secondary" 
                onClick={ onFetchQuizFromOpenTriviaDB }
              >
                Load Random Questions
              </button>
            : null
          }
        </div>
        <EditQuizForm 
          quiz={ editedQuiz } 
          quizId={ quizId }
          groupId={ groupId} 
          handleDone={ handleDone } 
        />
      </div>
}

export default EditQuiz;