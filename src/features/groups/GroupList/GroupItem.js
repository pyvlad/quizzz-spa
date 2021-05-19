import React from 'react';

import 'styles/btn.scss';
import './groups.scss';


const GroupItem = ({ groupMembership }) => {
  const { is_admin: isGroupAdmin, community: { name } = {} } = groupMembership;

  return <li className="groups__li">
    <a className="groups__li-link groups__li-link--with-actions" 
       href="">
      { name }
    </a>
    <div className="groups__li-actions">
      {
        isGroupAdmin
        ? <a className="btn btn--grey btn--rounded" 
             href="">
            Edit
          </a>
        : <form action="" method="post">
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
}

export default GroupItem;