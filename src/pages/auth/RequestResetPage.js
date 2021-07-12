import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { showMessage } from 'state';
import * as api from 'api';
import urlFor from 'urls';

import useSubmit from 'common/useSubmit';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import FormTextInput from 'common/FormTextInput';
import FormFieldErrors from 'common/FormFieldErrors';
import FormWrapper from 'common/FormWrapper';
import useTitle from 'common/useTitle';


const RequestResetPage = () => {

  useTitle("Request Password Reset");

  return (
    <FormWrapper>
      <RequestResetForm />
    </FormWrapper>
  )
}


const RequestResetForm = () => {

  // globals
  const history = useHistory();
  const dispatch = useDispatch();

  // local state
  const [email, setEmail] = React.useState("");

  // submission state
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => await api.requestPasswordResetEmail({ email }),
    () => {
      const msg = 'Instructions to reset your password have been sent to your email.';
      dispatch(showMessage(msg, 'success'));
      history.push(urlFor('HOME'));
    }
  );

  // error handling
  const {
    non_field_errors: nonFieldErrors,
    email: emailErrors,
  } = formErrors || {};

  // return component
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