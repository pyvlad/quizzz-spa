import React from 'react';

import initQuestionsReducer from './questionsReducer/init';
import questionsReducer from './questionsReducer/reducer';
import QuizContext from './questionsReducer/QuizContext';

import FormFieldErrors from 'common/FormFieldErrors';
import FormHeader from './FormHeader';
import FormHelp from './FormHelp';
import QuizTopicInput from './QuizTopicInput';
import QuestionInput from './QuestionInput';
import SaveDraftButton from './SaveDraftButton';
import QuizSubmitButton from './QuizSubmitButton';
import QuizDeleteButton from './QuizDeleteButton';


import 'styles/form.scss';


const EditQuiz = ({ quiz={}, readOnly=false }) => {

  const [topic, setTopic] = React.useState(quiz.topic ? quiz.topic : "");
  const [state, dispatch] = React.useReducer(
    questionsReducer, 
    { numQuestions: 2, numOptions: 3},
    initQuestionsReducer,
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const {
    non_field_errors: nonFieldErrors,
    topic: topicErrors,
  } = errors;

  const { questions } = state;

  return (
    <QuizContext.Provider value={state} >
      <div className="form">
        <FormFieldErrors errors={ nonFieldErrors } />
        <FormHeader />
        <FormHelp />
        <QuizTopicInput 
          topic={ topic } 
          setTopic={ setTopic } 
          errors={ topicErrors } 
          readOnly={ readOnly }
        />
        {
          questions.allIds.map((questionId, i) => (
            <QuestionInput
              key={ i }
              questionId={ questionId }
              questionIndex= { i }
              readOnly={ readOnly }
              dispatch={ dispatch }
            />
          ))
        }
        { readOnly ? null : <SaveDraftButton /> }
        { readOnly ? null : <QuizSubmitButton /> }
        { (readOnly || !quiz) ? null : <QuizDeleteButton />}
      </div>
    </QuizContext.Provider>
  )
}

export default EditQuiz;