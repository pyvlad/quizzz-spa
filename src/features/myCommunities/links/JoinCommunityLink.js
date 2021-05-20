import React from 'react';
import { Link } from 'react-router-dom';

import 'styles/form.scss';
import 'styles/btn.scss';


const JoinCommunityLink = () => (
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
      <Link className="btn btn--primary btn--block" to='/join/'>
        Join
      </Link>
    </div>
  </div>
)

export default JoinCommunityLink;