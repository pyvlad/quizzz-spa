import React from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';
import { Link } from 'react-router-dom';
import urlFor from 'urls';


const RoundsTableRow = ({ round, num, loggedAsGroupAdmin, onEdit }) => {
  
  const groupId = useSelector(selectActiveGroupId);
  
  const {
    id: roundId,
    finish_time,
    quiz: {
      name,
      user: {
        username
      },
    },
    user_play: play,
  } = round;

  return (
    <tr className={`table__tr ${(num % 2) ? "table__tr--odd" : "table__tr--even"}`}>
      <td className = "table__td table__td--centered">
        { num }
      </td>
      <td className="table__td">
        <Link to={ urlFor("ROUND", {groupId, roundId}) } >
          { name }
        </Link>
      </td>
      <td className="table__td table__td--centered">
        { username }
      </td>
      <td className="table__td table__td--centered">
        { moment(finish_time).format("MMM D, YYYY [at] h:mm a")}
      </td>
      <td className="table__td table__td--centered">
        { play ? "yes" : "no"}
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

export default RoundsTableRow;