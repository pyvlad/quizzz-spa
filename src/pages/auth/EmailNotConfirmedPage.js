import React from 'react';

import * as api from 'api';
import useSubmit from 'common/useSubmit';



const EmailNotConfirmedPage = () => {

  const { isLoading, errors, handleSubmit } = useSubmit(
    async () => await api.resendConfirmEmail(),
    () => console.log("sent")
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