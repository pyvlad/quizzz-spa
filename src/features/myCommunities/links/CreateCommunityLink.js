import React from 'react';
import { Link } from 'react-router-dom';

import 'styles/form.scss';
import 'styles/btn.scss';


const CreateCommunityLink = ({ onClick }) => (
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
      <Link className="btn btn--primary btn--block" to="/create/">
        Create
      </Link>
    </div>
  </div>
)

export default CreateCommunityLink;