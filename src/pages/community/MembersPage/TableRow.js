import React from 'react';

import MomentDateTime from 'common/MomentDateTime';

import 'styles/table.scss';
import 'styles/spacing.scss';
import 'styles/links.scss';


const MembersTableRow = ({ membership, num, loggedAsGroupAdmin, onEdit }) => {
  const {
    is_admin: isAdmin,
    is_approved: isApproved,
    user: {
      id: userId,
      username,
      time_created: timeCreated,
    },
  } = membership;

  return (
    <tr className={`table__tr ${(num % 2) ? "table__tr--odd" : "table__tr--even"}`}>
      <td className = "table__td table__td--centered">
        { num }
      </td>
      <td className="table__td">
        { username }
      </td>
      <td className="table__td table__td--centered">
        { userId }
      </td>
      <td className="table__td table__td--centered">
        <MomentDateTime 
          timestamp={ timeCreated } 
          func="format" 
          format="MMM D, YYYY [at] h:mm a"
          refresh={false}
        />
      </td>
      <td className="table__td table__td--centered">
        { isAdmin ? "admin" : (isApproved ? "" : "❓") }
      </td>
      <td className="table__td table__td--centered">
        { loggedAsGroupAdmin && !isAdmin 
          ? <button className="link link--decorated" onClick={ onEdit }>✎</button>
          : ""
        }
      </td>
    </tr>
  )
}

export default MembersTableRow;