import React from 'react';

import FormFieldErrors from 'features/common/FormFieldErrors';
import OptionInput from './OptionInput';

import { setQuestionText } from './questionsReducer/actions';
import { selectQuestionById } from './questionsReducer/selectors';
import QuizContext from './questionsReducer/QuizContext';

import 'styles/form.scss';


const QuestionInput = ({ questionId, questionIndex, readOnly, dispatch }) => {

  const onTextChange = (e) => dispatch(setQuestionText(questionId, e.target.value)); 
  const quizState = React.useContext(QuizContext);
  const question = selectQuestionById(quizState, questionId);
  const { text, options: optionIds } = question;
  const textErrors = null;

  return (
    <div className="form__item">
      <div className="form__label">
        Question { questionIndex + 1 }
      </div>

      <textarea 
        className="form__textarea" 
        onChange={ onTextChange }
        value={ text }
      />
      <FormFieldErrors errors={ textErrors } />

      <fieldset className="form__fieldset" disabled={ readOnly }>
        {
          optionIds.map((optionId, i) => (
            <OptionInput 
              key={ i }
              optionId={ optionId }
              questionId={ questionId }
              dispatch={ dispatch }
            />
          ))
        }
        <FormFieldErrors errors={ textErrors } />
      </fieldset>
    </div>
  )
}

export default QuestionInput;