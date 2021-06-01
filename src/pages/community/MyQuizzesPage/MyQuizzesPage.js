import React from 'react';

import MyQuizzes from './MyQuizzes/MyQuizzes';
import EditQuiz from './EditQuiz';


const quizzes = [];


const MyQuizzesPage = ({ communityId }) => {
  const [editingQuiz, setEditingQuiz] = React.useState(false);
  const [editedQuizId, setEditedQuizId] = React.useState(null);
  

  return (
    <div>
      <h2 className="heading heading--1">
        Your Quizzes
      </h2>
      {
        (!editingQuiz) 
        ? <div>
            <a className="btn btn--primary" onClick={() => setEditingQuiz(true)}>
              Create Quiz
            </a>
            <div className="my-3">
              <MyQuizzes />
            </div>
          </div>
        : <EditQuiz />
      }
    </div>
  )
}

export default MyQuizzesPage;