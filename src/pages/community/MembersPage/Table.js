import React from 'react';

import MembersTableRow from './TableRow';

import 'styles/table.scss';
import 'styles/spacing.scss';


const MembersTable = ({ members, loggedAsGroupAdmin, onEditMember }) => (
  <table className="table table--full-width my-3">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="40%">Name</th>
        <th width="10%">ID</th>
        <th width="25%">Account Created</th>
        <th width="10%">Status</th>
        <th width="10%">Actions</th>
      </tr>
    </thead>
    <tbody>
      { members.map((m,i) => 
        <MembersTableRow 
          key={ m.user.id } 
          membership={ m } 
          num={ i + 1 }
          loggedAsGroupAdmin={ loggedAsGroupAdmin }
          onEdit={ () => onEditMember(m.user.id) }
        />) 
      }
    </tbody>
  </table>
)

export default MembersTable;