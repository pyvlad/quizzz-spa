import React from 'react';

import RoundsTableRow from './TableRow';


const RoundsTable = ({ rounds, loggedAsGroupAdmin, onEditRound }) => (
  <table className="table table--full-width">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="25%">Name</th>
        <th width="25%">Author</th>
        <th width="25%">Finish Time</th>
        <th width="10%">Played</th>
        <th width="10%">Actions</th>
      </tr>
    </thead>
    <tbody>
      { 
        rounds.length 
        ? rounds.map((item,i) => 
          <RoundsTableRow 
            key={ item.id } 
            round={ item } 
            num={ i + 1 }
            loggedAsGroupAdmin={ loggedAsGroupAdmin }
            onEdit={ () => onEditRound(item.id) }
          />) 
        : <tr className={ "table__tr table__tr--odd" }>
            <td className="table__td" colSpan="6">
              Nothing here.
            </td>
          </tr>
      }
    </tbody>
  </table>
)

export default RoundsTable;