import React from 'react';
import { Link } from 'react-router-dom';

import urlFor from 'urls';

import 'styles/form.scss';
import 'styles/btn.scss';


const CreateCommunityLink = () => (
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
      <Link to={ urlFor("CREATE_COMMUNITY") }
        className="btn btn--primary btn--block"
      >
        Create
      </Link>
    </div>
  </div>
)

export default CreateCommunityLink;