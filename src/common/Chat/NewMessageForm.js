import React from 'react';
import * as api from 'api';

import FormFieldErrors from 'common/FormFieldErrors';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import useSubmit from 'common/useSubmit';


const NewMessageForm = ({ groupId, onMessagePosted }) => {
  
  // local state
  const [text, setText] = React.useState('');

  // submission state
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => await api.postChatMessage(groupId, { text }),
    msg => onMessagePosted(msg)
  );

  // errors
  const {
    non_field_errors: nonFieldErrors,
    text: textErrors,
  } = formErrors || {};
  
  return (
    <form onSubmit={ handleSubmit } className="form">
      <FormFieldErrors errors={ nonFieldErrors } />
      <FormHeader text="Compose New Message" />
      <FormHelp text="Please enter your message below." />

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