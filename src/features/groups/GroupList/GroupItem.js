import React from 'react';

import 'styles/btn.scss';
import './groups.scss';


const GroupItem = ({ group }) => (
  <li className="groups__li">
    <a className="groups__li-link groups__li-link--with-actions" 
       href={ group.view_url }>
      { group.name }
    </a>
    <div className="groups__li-actions">
      {
        group.isAdmin 
        ? <a className="btn btn--grey btn--rounded" 
             href={ group.edit_url }>
            Edit
          </a>
        : <form action="{{ group.leave_url }}" method="post">
            <input 
              className="btn btn--red btn--rounded"
              type="submit" 
              value="Leave"
              onClick={() => window.confirm('Are you sure you want to leave this group?')} 
            />
          </form>
      }
    </div>
  </li>
)

export default GroupItem;