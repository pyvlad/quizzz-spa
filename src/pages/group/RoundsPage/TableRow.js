import React from 'react';
import moment from 'moment';


const RoundsTableRow = ({ round, num, loggedAsGroupAdmin, onEdit }) => {
  const {
    finish_time,
    quiz: {
      name,
      user: {
        username
      },
    }
  } = round;

  return (
    <tr className={`table__tr ${(num % 2) ? "table__tr--odd" : "table__tr--even"}`}>
      <td className = "table__td table__td--centered">
        { num }
      </td>
      <td className="table__td">
        { name }
      </td>
      <td className="table__td table__td--centered">
        { username }
      </td>
      <td className="table__td table__td--centered">
        { moment(finish_time).format("MMM D, YYYY [at] h:mm a")}
      </td>
      <td></td>
      <td className="table__td table__td--centered">
        { loggedAsGroupAdmin 
          ? <button className="link link--decorated" onClick={ onEdit }>✎</button>
          : ""
        }
      </td>
    </tr>
  )
}

export default RoundsTableRow;