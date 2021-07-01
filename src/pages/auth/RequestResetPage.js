import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';

import { selectCurrentUser, selectAuthLoading } from 'state';
import * as api from 'api';
import urlFor from 'urls';

import useSubmit from 'common/useSubmit';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormFieldErrors from 'common/FormFieldErrors';
import FormWrapper from 'common/FormWrapper';



const RequestResetPage = () => {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);

  return (user && !loading)
    ? <Redirect to={ urlFor('HOME') } />
    : <FormWrapper>
        <RequestResetForm />
      </FormWrapper>
}


const RequestResetForm = () => {

  const history = useHistory();

  const [email, setEmail] = React.useState("");

  const { isLoading, errors, handleSubmit } = useSubmit(
    async () => await api.requestPasswordResetEmail({ email }),
    () => history.push(urlFor('HOME'))
  );

  const {
    non_field_errors: nonFieldErrors,
    email: emailErrors,
  } = errors;

  return (
    <Form onSubmit={ handleSubmit }>
      <FormHeader text={"Request Password Reset"} />
      <FormHelp text={`
        Please enter the email address you used to register with this wesbite.
        An email with instructions on how to select a new password will be sent to that address.`
      } />
      <FormFieldErrors errors={nonFieldErrors} />
      <FormTextInput
        labelText="Email"
        value={email}
        onValueChange={e => setEmail(e.target.value)}
        errors={emailErrors}
        type="email"
        placeholder="enter your email"
      />
      <div className="form__item text-centered">
        <input 
          type="submit"
          value="Send Email"
          className="btn btn--primary btn--mw150"
          disabled={isLoading}
        />
      </div>
    </Form>
  );
}

export default RequestResetPage;