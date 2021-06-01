import React from 'react';

import FormFieldErrors from 'features/common/FormFieldErrors';

import { setOptionText, setCorrectOption } from './questionsReducer/actions';
import { selectOptionById } from './questionsReducer/selectors';
import QuizContext from './questionsReducer/QuizContext';

import 'styles/form.scss';


const OptionInput = ({ optionId, questionId, dispatch }) => {
  // const radioId = `questions-${questionNumber}-answer-${optionNumber}`;
  // const radioName = `questions-${questionNumber}-answer`;
  // const inputId = `questions-${questionNumber}-option-${optionNumber}`;
  // const inputName = `questions-${questionNumber}-option-${optionNumber}-text`;

  const onTextChange = (e) => dispatch(setOptionText(optionId, e.target.value));
  const onSelectOption = () => dispatch(setCorrectOption(optionId, questionId));

  const quizState = React.useContext(QuizContext);
  const option = selectOptionById(quizState, optionId);
  const { text, isCorrect } = option;
  const optionErrors = null;

  return (
    <div className="form__fieldset-item">
      <input 
        value={ optionId } 
        type="radio" 
        checked={ isCorrect }
        onChange={ onSelectOption }
      />
      <label className="form__fieldset-item-input">
        <input 
          value={ text }
          type="text"
          className="form__input"
          onChange={ onTextChange }
        />
      </label>
      <FormFieldErrors errors={ optionErrors } />
    </div>
  )
}

export default OptionInput;
