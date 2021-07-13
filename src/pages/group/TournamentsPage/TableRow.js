import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';
import { Link } from 'react-router-dom';
import urlFor from 'urls';

import MomentDateTime from 'common/MomentDateTime';


const TournamentsTableRow = ({ tournament, num, loggedAsGroupAdmin, onEdit }) => {
  
  const groupId = useSelector(selectActiveGroupId);

  const {
    id,
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
        <Link to={ urlFor("TOURNAMENT_ROUNDS", {groupId, tournamentId: id}) } className="link">
          { name }
        </Link>
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