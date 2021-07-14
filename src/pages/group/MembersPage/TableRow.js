import React from 'react';
import moment from 'moment';


const MembersTableRow = ({ membership, num, loggedAsGroupAdmin, onEdit }) => {

  const {
    is_admin: isAdmin,
    is_approved: isApproved,
    time_created: timeCreated,  // membership created (not user)
    user: {
      username,
      last_login: lastLogin,
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
        { moment(lastLogin).fromNow() }
      </td>
      <td className="table__td table__td--centered">
        { moment(timeCreated).format("MMM D, YYYY") }
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