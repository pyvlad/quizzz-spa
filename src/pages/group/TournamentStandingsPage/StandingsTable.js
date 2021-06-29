import React from 'react';


const StandingsTable = ({ standings, userId }) => (
  <table className="table table--full-width table--colorful">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="45%">user</th>
        <th width="12.5%">rounds</th>
        <th width="12.5%">p/a</th>
        <th width="12.5%">points</th>
        <th width="12.5%">p/a</th>
      </tr>
    </thead>
    <tbody>
      {
        standings.map((row, i) => (
          <tr key={row.user_id}
            className={`
              table__tr 
              table__tr--${i % 2 ? 'odd' : 'even' }
              ${(row.user_id === userId) ? 'table__tr--bold' : ""}
            `}
          >
            <td className="table__td table__td--centered">
              { i + 1 }
            </td>
            <td className="table__td">
              { row.user }
            </td>
            <td className="table__td table__td--centered">
              { row.rounds }
            </td>
            <td className="table__td table__td--centered">
              <small>{ row.rounds_played }/{ row.rounds_authored }</small>
            </td>
            <td className="table__td table__td--centered">
              { row.points }
            </td>
            <td className="table__td table__td--centered">
              <small>{ row.points_played }/{ row.points_authored }</small>
            </td>
          </tr>
        ))
      }
    </tbody>
</table>
)

export default StandingsTable;