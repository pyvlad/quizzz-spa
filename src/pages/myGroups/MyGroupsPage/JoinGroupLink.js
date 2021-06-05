import React from 'react';
import { Link } from 'react-router-dom';

import urlFor from 'urls';


const JoinGroupLink = () => (
  <div className="form">
    <div className="form__header">
      Join
    </div>
    <div className="form__item">
      <div className="form__help">
        Join an existing group.
      </div>
    </div>
    <div className="form__item">
      <Link to={ urlFor("JOIN_GROUP") }
        className="btn btn--primary btn--block"
      >
        Join
      </Link>
    </div>
  </div>
)

export default JoinGroupLink;