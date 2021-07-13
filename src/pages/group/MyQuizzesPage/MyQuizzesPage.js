import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import MyQuizzes from './MyQuizzes/MyQuizzes';
import EditQuiz from './EditQuiz';
import CreateQuizButton from './CreateQuizButton';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import urlFor from 'urls';


const MyQuizzesPage = () => {

  const groupId = useSelector(selectActiveGroupId);
  
  useGroupPageTitle(groupId, "My Quizzes");

  const getItem = React.useCallback(() => ({
    text: "My Quizzes", 
    url: urlFor("GROUP_MY_QUIZZES", {groupId}), 
    isName: false
  }), [groupId]);
  useNavbarItem(getItem);

  const [editedQuizId, setEditedQuizId] = React.useState(null);
  const handleEditQuiz = quizId => setEditedQuizId(quizId);
  const handleFinishEditingQuiz = () => setEditedQuizId(null);

  return (
    <div>
      <h2 className="heading heading--1">
        Your Quizzes
      </h2>
      {
        (!editedQuizId) 
        ? <div>
            <CreateQuizButton handleEditQuiz={ handleEditQuiz } />
            <div className="my-3">
              <MyQuizzes onEditQuiz={ handleEditQuiz } />
            </div>
          </div>
        : <EditQuiz 
            quizId={ editedQuizId } 
            handleDone={ handleFinishEditingQuiz } 
          />
      }
    </div>
  )
}

export default MyQuizzesPage;