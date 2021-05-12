import React from 'react';

import 'styles/form.scss';
import 'styles/btn.scss';


const GroupCreateForm = () => (
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
      <a className="btn btn--primary btn--block"
          href="{{ url_for('groups.edit', group_id=0) }}">
        Create
      </a>
    </div>
  </div>
)

export default GroupCreateForm;