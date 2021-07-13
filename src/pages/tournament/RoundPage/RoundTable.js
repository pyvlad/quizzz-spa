import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveTournamentId } from 'state';

import moment from 'moment';
import { Link } from 'react-router-dom';
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
    user_play: play,
  } = round;

  const isTaken = !!(play)

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
        <td className="pr-4">
          Your Action
        </td>
        <td>
          {
            (!(isTaken || isAuthor) && status === "current")
            ? <Link 
                className="btn btn--primary my-3" 
                to={ urlFor("PLAY_ROUND", {groupId, tournamentId, roundId}) }
              >
                Take Quiz
              </Link>
            : ((isTaken || isAuthor) 
                ? <Link 
                    className="btn btn--secondary my-3"
                    to={ urlFor("REVIEW_ROUND", {groupId, tournamentId, roundId}) }
                  >
                    Review Quiz
                  </Link>
                : null
              )
          }
        </td>
      </tr>
    </tbody>
  </table>
}

export default RoundTable;