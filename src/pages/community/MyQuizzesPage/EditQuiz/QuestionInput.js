import React from 'react';

import FormFieldErrors from 'common/FormFieldErrors';
import OptionInput from './OptionInput';

import { setQuestionText } from './questionsReducer/actions';
import { selectQuestionById } from './questionsReducer/selectors';
import QuizContext from './questionsReducer/QuizContext';

import 'styles/form.scss';


const QuestionInput = ({ questionId, questionIndex, readOnly, errors={}, dispatch }) => {

  const onTextChange = (e) => dispatch(setQuestionText(questionId, e.target.value)); 
  const quizState = React.useContext(QuizContext);
  const question = selectQuestionById(quizState, questionId);
  const { text, options: optionIds } = question;
  const nonFieldErrors = errors.non_field_errors ? errors.non_field_errors : [];
  const textErrors = errors.text ? errors.text : [];
  const optionsErrors = errors.options ? errors.options : [];

  return (
    <div className="form__item">
      <div className="form__label">
        Question { questionIndex + 1 }
      </div>

      <FormFieldErrors errors={ nonFieldErrors } />

      <textarea 
        className="form__textarea" 
        onChange={ onTextChange }
        value={ text }
        disabled={ readOnly }
      />
      <FormFieldErrors errors={ textErrors } />

      <fieldset className="form__fieldset" disabled={ readOnly }>
        {
          optionIds.map((optionId, i) => (
            <OptionInput 
              key={ i }
              optionId={ optionId }
              questionId={ questionId }
              errors={ optionsErrors.length > i ? optionsErrors[i] : {} }
              dispatch={ dispatch }
            />
          ))
        }
      </fieldset>
    </div>
  )
}

export default QuestionInput;