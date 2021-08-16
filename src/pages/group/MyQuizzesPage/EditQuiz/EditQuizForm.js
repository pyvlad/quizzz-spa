import React from 'react';

import initQuestionsReducer from './questionsReducer/init';
import questionsReducer from './questionsReducer/reducer';
import QuizContext from './questionsReducer/QuizContext';

import { useSubmit } from 'common/useApi';
import Form from 'common/Form';
import FormFieldErrors from 'common/FormFieldErrors';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';

import QuestionInput from './QuestionInput';
import SaveDraftButton from './SaveDraftButton';
import QuizSubmitButton from './QuizSubmitButton';
import QuizDeleteButton from './QuizDeleteButton';

import * as api from 'api';
import { selectQuestionsToSubmit } from './questionsReducer/selectors';


const EditQuizForm = ({ quiz=null, quizId, handleDone, groupId }) => {

  // INITIAL DATA
  const readOnly = quiz ? quiz.is_finalized : false;

  const [name, setName] = React.useState(quiz ? quiz.name : "");
  const [state, dispatch] = React.useReducer(
    questionsReducer, 
    quiz ? quiz.questions : [],
    initQuestionsReducer,
  );

  const { questions } = state;

  // SUBMISSION HANDLING
  let finalizeOnSubmit = false;   // use closure to get the right action

  const getPayload = () => ({
    name, 
    is_finalized: finalizeOnSubmit,
    questions: selectQuestionsToSubmit(state)
  });

  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => {
      const payload = getPayload();
      return await api.updateQuiz(groupId, quizId, payload);
    },
    handleDone
  );

  const handleSaveDraft = (e) => {
    e.preventDefault();
    finalizeOnSubmit = false;
    handleSubmit(e);
  }

  const handleFinalize = (e) => {
    e.preventDefault();
    finalizeOnSubmit = true;
    handleSubmit(e);
  }

  // ERRORS
  const {
    non_field_errors: nonFieldErrors,
    name: nameErrors,
    questions: questionsErrors,
  } = formErrors || {};

  const questionsFieldErrors = (
    questionsErrors 
    && questionsErrors.length 
    && typeof questionsErrors[0] === "string"
  ) ? questionsErrors : [];

  const getQuestionErrors = (errors, index) => (
    errors.questions 
    && (errors.questions.length > index)
    && typeof errors.questions[0] != "string"
  ) ? errors.questions[index] : [];


  // RENDERING
  return (
    <QuizContext.Provider value={state} >
      <Form>
        <FormFieldErrors errors={ nonFieldErrors } />
        <FormHeader text="Create Quiz" />
        <FormHelp text="Fill this form to create a quiz." />
        <FormTextInput 
          labelText="Quiz Name:"
          value={ name } 
          onValueChange={ (e) => { if (!readOnly) setName(e.target.value) } } 
          errors={ nameErrors } 
          disabled={ readOnly }
        />
        <FormFieldErrors errors={ questionsFieldErrors } />
        {
          questions.allIds.map((questionId, i) => (
            <QuestionInput
              key={ i }
              questionId={ questionId }
              questionIndex= { i }
              readOnly={ readOnly }
              errors={ getQuestionErrors(formErrors || {}, i) }
              dispatch={ dispatch }
            />
          ))
        }
        { readOnly ? null : <SaveDraftButton onClick={ handleSaveDraft } disabled={isLoading} /> }
        { readOnly ? null : <QuizSubmitButton onClick={ handleFinalize } disabled={isLoading} /> }
        { (readOnly || !quiz) 
          ? null 
          : <QuizDeleteButton 
              groupId={groupId} 
              quizId={quizId} 
              onFinished={ handleDone } 
            />
        }
      </Form>
    </QuizContext.Provider>
  )
}

export default EditQuizForm;