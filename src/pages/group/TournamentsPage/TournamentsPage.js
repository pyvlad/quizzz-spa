import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';
import { selectMyMembershipByGroupId } from 'state';
import * as api from 'api';

import TournamentsTable from './Table';
import FormWrapper from './FormWrapper';
import EditTournamentForm from './EditTournamentForm';
import DeleteTournamentButton from './DeleteTournamentButton';
import FilterTabs from './FilterTabs';


const TournamentsPage = () => {

  const groupId = useSelector(selectActiveGroupId);

  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const { is_admin: loggedAsGroupAdmin } = membership;

  const [tournaments, setTournaments] = React.useState([]);
  const [editedTournamentId, setEditedTournamentId] = React.useState(null);

  // On mount, fetch list of group tournaments
  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getCommunityTournaments(groupId);
        setTournaments(data);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [groupId, setTournaments])

  // HANDLERS
  const handleTournamentUpdated = (updatedTournament) => {
    const tournamentIndex = tournaments.findIndex(t => t.id === updatedTournament.id);
    let newTournaments = [];
    if (tournamentIndex >= 0) {
      newTournaments = [
        ...tournaments.slice(0, tournamentIndex), 
        updatedTournament,
        ...tournaments.slice(tournamentIndex + 1)
      ]
    } else {
      newTournaments = [
        updatedTournament,
        ...tournaments,
      ]
    }
    setEditedTournamentId(null);
    setTournaments(newTournaments);
  }

  const handleTournamentDeleted = (tournamentId) => {
    const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);
    let newTournaments = tournaments.slice();
    newTournaments.splice(tournamentIndex, 1);
    setEditedTournamentId(null);
    setTournaments(newTournaments);
  }

  // FILTERS
  // define filters
  const filters = ["active", "inactive", "all"];
  const [activeFilter, setActiveFilter] = React.useState("all");

  // apply current filter
  let rows = [...tournaments];
  if (activeFilter === "active") {
    rows = rows.filter(r => r.is_active)
  } else if (activeFilter === "inactive") {
    rows = rows.filter(r => !r.is_active);
  }

  return (
    <div>
      <h2 className="heading heading--1">
        Group Tournaments
      </h2>
      {
        loggedAsGroupAdmin 
        ? <button 
            className="btn btn--primary mb-3"
            onClick={ () => setEditedTournamentId(0) }
          >
            Create Tournament
          </button>
        : null
      }
      <FilterTabs 
        filters={ filters } 
        activeFilter={ activeFilter } 
        onSelectFilter={ setActiveFilter } 
      />
      {
        (editedTournamentId !== null)
        ? <div>
            <button onClick={() => setEditedTournamentId(null)} 
              className="btn btn--grey btn--mw150">⏎ back</button>
            <FormWrapper>
              <EditTournamentForm
                tournament={ tournaments.find(t => t.id === editedTournamentId) } 
                onTournamentUpdate={ t => handleTournamentUpdated(t) }
              />
              {
                editedTournamentId 
                ? <DeleteTournamentButton
                  tournament={ tournaments.find(t => t.id === editedTournamentId) }
                  onTournamentDelete={ () => handleTournamentDeleted(editedTournamentId) }
                />
                : null
              }
            </FormWrapper>
          </div>
        : <div>
            <h3 className="heading heading--2">
              Tournament List
            </h3>
            <TournamentsTable 
              tournaments={ rows } 
              loggedAsGroupAdmin={ loggedAsGroupAdmin } 
              onEditTournament={ tournamentId => setEditedTournamentId(tournamentId) }
            />
          </div>
      }
    </div>
  )
}

export default TournamentsPage;