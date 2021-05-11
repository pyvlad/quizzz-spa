import React from 'react';
import { useSelector } from 'react-redux';

import { selectAuthLoading, selectAuthError } from 'features/auth/authSlice';
import './Message.scss';


const Message = () => {
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const msg = isLoading 
    ? 'Please, wait...'
    : ((authError) ? authError : "")

  return msg 
    ? <div className="flash-messages my-3">
        <div className="flash-messages__item flash-messages__item--error my-2 p-2">
          { msg }
        </div>
      </div>
    : null;
}

export default Message;