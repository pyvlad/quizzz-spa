import React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'api';
import { showMessage } from 'state';

import { useSubmit } from 'common/useApi';
import useTitle from 'common/useTitle';


const EmailNotConfirmedPage = () => {

  useTitle("Email Confirmation Required");

  // globals
  const dispatch = useDispatch();

  // submission state
  const { handleSubmit } = useSubmit(
    async () => await api.resendConfirmEmail(),
    () => {
      const msg = 'A new confirmation email has been sent to you. Check your email inbox.';
      dispatch(showMessage(msg, 'success'));
    }
  );

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 bg-grey p-4">
          <h1 className="heading heading--1">
            Confirm Your Email
          </h1>
          <p className="my-3">
            Dear User,
            <br/><br/>
            Before you can access the website, you need to confirm your email address.
            <br/><br/>
            Check your email inbox (or spam folder, if there is nothing in your inbox),
            and follow the instructions there.
            <br/><br/>
            <button className="link" onClick={ handleSubmit }>
              Click here
            </button> if you need another confirmation email.
            <br/><br/>
            If you already confirmed your email in another browser (or on a different device),
            then simply log out and log back in to get rid of this message.
          </p>
          <p className="my-3">
            Sincerely,<br/>
            The Quizzz Team
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailNotConfirmedPage;