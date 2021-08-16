import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import EditQuizForm from './EditQuizForm';
import * as api from 'api';


const difficulties = [
  {value: "any", label: "Any Difficulty"},
  {value: "easy", label: "Easy"},
  {value: "medium", label: "Medium"},
  {value: "hard", label: "Hard"},
]

const categories = [
  {value: "any", label: "Any Category"},
  {value: "9", label: "General Knowledge"},
  {value: "21", label: "Sports"},
  {value: "22", label: "Geography"},
  {value: "23", label: "History"}, 
]



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


  const [difficulty, setDifficulty] = React.useState("any");
  const [category, setCategory] = React.useState("any");

  const onFetchQuizFromOpenTriviaDB = async (e) => {
    e.preventDefault();

    setUpdating(true);
    setEditedQuiz(await api.fetchQuestionsFromOpenTriviaDB(editedQuiz, difficulty, category));
    setUpdating(false); 
  }

  return ((quizId && !editedQuiz) || (updating))
    ? <div>Loading...</div>
    : <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <button 
              onClick={ handleDone } 
              className="btn btn--grey btn--mw150"
            >
              ⏎ back
            </button>
          </div>
          { 
            editedQuiz 
            ? <div className="bg-grey p-2">
                <button 
                  className="btn btn--secondary btn--block" 
                  onClick={ onFetchQuizFromOpenTriviaDB }
                >
                  Load Random Questions
                </button>
                <div className="my-2">
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    { difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>) }
                  </select>
                </div>
                <div className="my-2">
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    { categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>) }
                  </select>
                </div>
                <div className="text-small"><em>
                  Questions are loaded from&nbsp;
                    <a href="https://opentdb.com/" target="_blank" rel="noreferrer">
                      Open Trivia DB
                    </a>.
                  </em>
                </div>
              </div>
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