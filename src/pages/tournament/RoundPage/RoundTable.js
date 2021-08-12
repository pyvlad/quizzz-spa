import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectActiveTournamentId } from 'state';
import urlFor from 'urls';


const RoundTable = ({ round, groupId }) => {

  const tournamentId = useSelector(selectActiveTournamentId);

  const {
    id: roundId,
    quiz: {
      name: quizName,
      user: {
        username: quizAuthor,
      }
    },
    start_time: startTime,
    finish_time: finishTime,
    is_author: isAuthor,
    status,
    user_play_id: playId,
    user_play_is_submitted: isPlaySubmitted,
  } = round;

  const isPlayStarted = !!(playId)

  return <table>
    <tbody>
      <tr>
        <td>Name</td>
        <td>{ quizName }</td>
      </tr>
      <tr>
        <td>Author</td>
        <td>{ quizAuthor }</td>
      </tr>
      <tr>
        <td>Start Time</td>
        <td>{ moment(startTime).format("MMM D, YYYY [at] h:mm a") }</td>
      </tr>
      <tr>
        <td>Finish Time</td>
        <td>{ moment(finishTime).format("MMM D, YYYY [at] h:mm a") }</td>
      </tr>
      <tr>
        <td colSpan="2" className="py-2">
          {
            (!(isPlaySubmitted || isAuthor) && status === "current")
            ? <Link 
                className="btn btn--primary" 
                to={ urlFor("PLAY_ROUND", {groupId, tournamentId, roundId}) }
              >
                { isPlayStarted ? "Continue Quiz" : "Take Quiz" }
              </Link>
            : ((isPlaySubmitted || isAuthor) 
                ? <Link 
                    className="btn btn--primary"
                    to={ urlFor("REVIEW_ROUND", {groupId, tournamentId, roundId}) }
                  >
                    Review
                  </Link>
                : null
              )
          }
          {
            (isPlaySubmitted || isAuthor) ?
            <Link className="btn btn--secondary"
              to={ urlFor("DISCUSS_ROUND", { groupId, tournamentId, roundId }) }
            >Discuss</Link>
            : null
          }
        </td>
      </tr>
    </tbody>
  </table>
}

export default RoundTable;