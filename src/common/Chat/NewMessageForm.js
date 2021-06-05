import React from 'react';
import * as api from 'api';

import FormFieldErrors from 'common/FormFieldErrors';


const NewMessageForm = ({ groupId, onSubmit }) => {
  const [text, setText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;

      try {
        await api.postChatMessage(groupId, { text });
        success = true;
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        onSubmit();
      }
    }
  }

  const {
    non_field_errors: nonFieldErrors,
    text: textErrors,
  } = errors;
  
  return (
    <form onSubmit={ handleSubmit } className="form">
      <FormFieldErrors errors={ nonFieldErrors } />
      
      <div className="form__header">
        Create New message
      </div>

      <div className="form__item">
        <div className="form__help">
          Please enter your message below.
        </div>
      </div>

      <div className="form__item">
        <textarea 
          className="form__textarea form__textarea--lg" 
          onChange={ (e) => setText(e.target.value) }
          value={ text }
        />
        <FormFieldErrors errors={ textErrors } />
      </div>

      <div className="form__item">
        <input className="btn btn--secondary btn--block"
          type="submit"
          value="Submit"
          disabled={ isLoading }
        />
      </div>
    </form>
  )
}

export default NewMessageForm;