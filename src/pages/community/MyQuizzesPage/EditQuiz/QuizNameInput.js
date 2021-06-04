import React from 'react';

import FormFieldErrors from 'common/FormFieldErrors';

import 'styles/form.scss';


const QuizNameInput = ({ name, setName, errors, readOnly }) => {
  return (
    <div className="form__item">
      <label className="form__label" htmlFor="quizTopicInput">
        Quiz Name:
      </label>
      <input 
        type="text" 
        value={ name } 
        disabled={ readOnly }
        onChange={ 
          (e) => { 
            if (!readOnly) setName(e.target.value) 
          } 
        }
        className="form__input"
        id="quizTopicInput"
      />
      <FormFieldErrors errors={ errors } />
    </div>
  )
}

export default QuizNameInput;