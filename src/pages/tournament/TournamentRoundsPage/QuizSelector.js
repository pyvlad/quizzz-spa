import React from 'react';
import moment from 'moment';
import * as api from 'api';


const QuizPoolTableRow = ({ quiz, num, onSelectQuiz }) => {
  return (
    <tr className={`link link--grey text-small table__tr ${((num + 1) % 2) ? "table__tr--odd" : "table__tr--even"}`}
      onClick={() => onSelectQuiz(quiz.id)}
    >
      <td className="table__td">
        { quiz.user.username }
      </td>
      <td className="table__td">
        { quiz.name }
      </td>
      <td className="table__td table__td--centered">
        { moment(quiz.time_updated).format("YYYY-MM-DD HH:mm") }
      </td>
    </tr>
  )
}


const QuizPoolTable = ({quizPool, onSelectQuiz}) => {
  return (
    <table className="table table--full-width">
      <thead>
        <tr>
          <th width="25%">Author</th>
          <th width="35%">Name</th>
          <th width="40%">Submitted</th>
        </tr>
      </thead>
      <tbody>
        {
          quizPool.length 
          ? quizPool.map((quiz, i) => (
              <QuizPoolTableRow 
                key={quiz.id} 
                quiz={quiz} 
                num={i} 
                onSelectQuiz={onSelectQuiz} 
              />)
            )
          : <tr className="table__tr table__tr--odd">
              <td className="table__td" colSpan="3">
                No quizzes available.
              </td>
            </tr>
        }
      </tbody>
    </table>
  )
}


const SelectedQuizTable = ({selectedQuiz}) => {
  return (
    <table className="table table--full-width table--colorful">
      <thead>
        {
          selectedQuiz
          ? <tr>
              <th width="25%">
                {selectedQuiz.user.username}
              </th>
              <th width="35%">
                {selectedQuiz.name}
              </th>
              <th width="40%">
                {moment(selectedQuiz.time_submitted).format("YYYY-MM-DD HH:mm")}
              </th>
            </tr>
          : <tr>
              <th colSpan="3">
                No quiz selected.
              </th>
            </tr>
        }
      </thead>
    </table>
  )
}


const QuizSelector = ({selectedQuizId, onSelectQuiz, groupId, editedQuiz}) => {
  // edited quiz is not a part of quiz pool as it has a round attached to it 
  // - we need to manually add it to the pool (unless it's `null`)
  
  const [quizPool, setQuizPool] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getQuizPool(groupId);
        if (editedQuiz) {
          data.splice(0, 0, editedQuiz);
        }
        setQuizPool(data);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [groupId, setQuizPool, editedQuiz])
  
  const selectedQuiz = quizPool.find(q => q.id === selectedQuizId);
  
  const [isHidden, setIsHidden] = React.useState(true);

  const toggleIsHidden = (e) => {
    e.preventDefault();
    setIsHidden(prevValue => !prevValue);
  }

  return (
    <div>
      <SelectedQuizTable selectedQuiz={selectedQuiz} />
      <button className = "btn btn--grey my-2" onClick={toggleIsHidden}>
        { isHidden ? "Show quiz pool" : "Hide quiz pool" }
      </button>
      {
        isHidden
        ? null
        : <QuizPoolTable quizPool={quizPool} onSelectQuiz={onSelectQuiz} />
      }
    </div>
  )
}

export default QuizSelector;