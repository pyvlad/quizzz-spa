import React from 'react';

import FormFieldErrors from 'features/common/FormFieldErrors';

import 'styles/form.scss';


const QuizTopicInput = ({ topic, setTopic, errors, readOnly }) => {
  return (
    <div className="form__item">
      <label className="form__label" htmlFor="quizTopicInput">
        Quiz Topic:
      </label>
      <input 
        type="text" 
        value={ topic } 
        disabled={ readOnly }
        onChange={ 
          (e) => { 
            if (!readOnly) setTopic(e.target.value) 
          } 
        }
        className="form__input"
        id="quizTopicInput"
      />
      <FormFieldErrors errors={ errors } />
    </div>
  )
}

export default QuizTopicInput;