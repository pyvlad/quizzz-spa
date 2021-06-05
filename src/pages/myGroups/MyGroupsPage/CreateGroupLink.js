import React from 'react';
import { Link } from 'react-router-dom';

import urlFor from 'urls';


const CreateGroupLink = () => (
  <div className="form">
    <div className="form__header">
      Create
    </div>
    <div className="form__item">
      <div className="form__help">
        Create new group.
      </div>
    </div>
    <div className="form__item">
      <Link to={ urlFor("CREATE_GROUP") }
        className="btn btn--primary btn--block"
      >
        Create
      </Link>
    </div>
  </div>
)

export default CreateGroupLink;