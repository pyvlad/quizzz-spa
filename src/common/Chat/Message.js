import React from 'react';
import moment from 'moment';

import MomentDateTime from 'common/MomentDateTime';

import 'styles/message.scss';
import 'styles/btn.scss';


const Message = ({ msg }) => {
  const { 
    text,
    time_created: timeCreated,
    user: { username }
  } = msg;

  return (
    <article className="message">
      <div className="message__details">
        <div className="message__details-main">
          <div className="message__details-item message__author">
            { username }
          </div>
          <div className="message__details-item">
            <MomentDateTime timestamp={timeCreated} />
          </div>
          <div className="message__details-item">
            { moment(timeCreated).format("MMM D, YYYY [at] h:mm a") }
          </div>
        </div>
      </div>
      <p className="message__text">
        { text }
      </p>
    </article>
  )
}

export default Message;
