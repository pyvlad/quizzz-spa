import React from 'react';

import MomentDateTime from 'common/MomentDateTime';


const TournamentsTableRow = ({ tournament, num, loggedAsGroupAdmin, onEdit }) => {
  const {
    name,
    is_active: isActive,
    time_created: timeCreated,
  } = tournament;

  return (
    <tr className={`table__tr ${(num % 2) ? "table__tr--odd" : "table__tr--even"}`}>
      <td className = "table__td table__td--centered">
        { num }
      </td>
      <td className="table__td">
        { name }
      </td>
      <td className="table__td table__td--centered">
        { isActive ? "yes" : "no" }
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
        { loggedAsGroupAdmin 
          ? <button className="link link--decorated" onClick={ onEdit }>✎</button>
          : ""
        }
      </td>
    </tr>
  )
}

export default TournamentsTableRow;