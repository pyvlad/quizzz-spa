import React from 'react';

import FormFieldErrors from 'common/FormFieldErrors';

import { setOptionText, setCorrectOption } from './questionsReducer/actions';
import { selectOptionById } from './questionsReducer/selectors';
import QuizContext from './questionsReducer/QuizContext';

import 'styles/form.scss';


const OptionInput = ({ optionId, questionId, errors, dispatch }) => {

  const onTextChange = (e) => dispatch(setOptionText(optionId, e.target.value));
  const onSelectOption = () => dispatch(setCorrectOption(optionId, questionId));

  const quizState = React.useContext(QuizContext);
  const option = selectOptionById(quizState, optionId);
  const { text, isCorrect } = option;
  const textErrors = errors.text ? errors.text : [];

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
      <FormFieldErrors errors={ textErrors } />
    </div>
  )
}

export default OptionInput;
