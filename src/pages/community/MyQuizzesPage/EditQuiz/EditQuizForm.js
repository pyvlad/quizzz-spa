import React from 'react';

import initQuestionsReducer from './questionsReducer/init';
import questionsReducer from './questionsReducer/reducer';
import QuizContext from './questionsReducer/QuizContext';

import FormFieldErrors from 'common/FormFieldErrors';
import FormHeader from './FormHeader';
import FormHelp from './FormHelp';
import QuizNameInput from './QuizNameInput';
import QuestionInput from './QuestionInput';
import SaveDraftButton from './SaveDraftButton';
import QuizSubmitButton from './QuizSubmitButton';
import QuizDeleteButton from './QuizDeleteButton';

import { fetchDeleteQuiz, fetchUpdateQuiz } from 'api';
import { selectQuestionsToSubmit } from './questionsReducer/selectors';


import 'styles/form.scss';


const EditQuizForm = ({ quiz=null, quizId, handleDone, communityId }) => {

  const readOnly = quiz ? quiz.is_finalized : false;

  const [name, setName] = React.useState(quiz ? quiz.name : "");
  const [state, dispatch] = React.useReducer(
    questionsReducer, 
    quiz ? quiz.questions : [],
    initQuestionsReducer,
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
  } = errors;

  const questionsErrors = (
    errors.questions 
    && errors.questions.length 
    && typeof errors.questions[0] === "string"
  ) ? errors.questions : [];

  const getQuestionErrors = (errors, index) => (
    errors.questions 
    && (errors.questions.length > index)
    && typeof errors.questions[0] != "string"
  ) ? errors.questions[index] : [];

  const { questions } = state;


  // handlers
  const handleSubmit = async (e, isFinalized) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;

      try {
        await fetchUpdateQuiz(
          communityId, 
          quizId,
          {
            name, 
            is_finalized: isFinalized,
            questions: selectQuestionsToSubmit(state)
          }
        );
        success = true;
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        handleDone();
      }
    }
  }

  console.log(errors);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!isLoading) {

      const confirmed = window.confirm(`Are you sure you want to delete this quiz?`);
      if (!confirmed) return;

      setErrors({});
      setIsLoading(true);
      let success = false;

      try {
        await fetchDeleteQuiz(communityId, quizId);
        success = true;
      } catch(err) {
        setErrors({non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        handleDone();
      }
    }
  }




  return (
    <QuizContext.Provider value={state} >
      <div className="form">
        <FormFieldErrors errors={ nonFieldErrors } />
        <FormHeader />
        <FormHelp />
        <QuizNameInput 
          name={ name } 
          setName={ setName } 
          errors={ nameErrors } 
          readOnly={ readOnly }
        />
        <FormFieldErrors errors={ questionsErrors } />
        {
          questions.allIds.map((questionId, i) => (
            <QuestionInput
              key={ i }
              questionId={ questionId }
              questionIndex= { i }
              readOnly={ readOnly }
              errors={ getQuestionErrors(errors, i) }
              dispatch={ dispatch }
            />
          ))
        }
        { readOnly ? null : <SaveDraftButton onClick={ (e) => handleSubmit(e, false) } /> }
        { readOnly ? null : <QuizSubmitButton onClick={ (e) => handleSubmit(e, true) } /> }
        { (readOnly || !quiz) ? null : <QuizDeleteButton onClick={ handleDelete } />}
      </div>
    </QuizContext.Provider>
  )
}

export default EditQuizForm;