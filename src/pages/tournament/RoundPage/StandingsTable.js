import React from 'react';


const StandingsTable = ({ standings, userId }) => (
  <table className="table table--full-width table--colorful">
    <thead>
      <tr>
        <th width="10%">#</th>
        <th width="42%">user</th>
        <th width="16%">result</th>
        <th width="16%">time</th>
        <th width="16%">score</th>
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
              { row.result }
            </td>
            <td className="table__td table__td--centered">
              { row.time ? Number.parseFloat(row.time).toFixed(1) : "" }
            </td>
            <td className="table__td table__td--centered">
              <strong>{ Number.parseFloat(row.score).toFixed(1) }</strong>
            </td>
          </tr>
        ))
      }
    </tbody>
</table>
)

export default StandingsTable;