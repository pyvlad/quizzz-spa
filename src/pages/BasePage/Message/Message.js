import React from 'react';
import './Message.scss';


const Message = ({ msg }) => {
  return msg 
    ? <div className="flash-messages my-3">
        <div className="flash-messages__item flash-messages__item--error my-2 p-2">
          { msg }
        </div>
      </div>
    : null;
}

export default Message;