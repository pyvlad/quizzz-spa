import React from 'react';

import TournamentsTableRow from './TableRow';


const TournamentsTable = ({ tournaments, loggedAsGroupAdmin, onEditTournament }) => (
  <table className="table table--full-width">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="50%">Name</th>
        <th width="10%">Active</th>
        <th width="25%">Time Created</th>
        <th width="10%">Actions</th>
      </tr>
    </thead>
    <tbody>
      { tournaments.map((t,i) => 
        <TournamentsTableRow 
          key={ t.id } 
          tournament={ t } 
          num={ i + 1 }
          loggedAsGroupAdmin={ loggedAsGroupAdmin }
          onEdit={ () => onEditTournament(t.id) }
        />) 
      }
    </tbody>
  </table>
)

export default TournamentsTable;