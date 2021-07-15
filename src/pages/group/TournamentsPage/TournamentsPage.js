import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';
import { selectMyMembershipByGroupId } from 'state';
import * as api from 'api';
import urlFor from 'urls';

import TournamentsTable from './Table';
import FormWrapper from './FormWrapper';
import EditTournamentForm from './EditTournamentForm';
import DeleteTournamentButton from './DeleteTournamentButton';
import FilterTabs from 'common/FilterTabs';
import useListUpdateDeleteViews from 'common/useListUpdateDeleteViews';
import { useFetchedListOfItems } from 'common/useApi';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';



const TournamentsPage = () => {

  // page parameters
  const groupId = useSelector(selectActiveGroupId);
  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const { is_admin: loggedAsGroupAdmin } = membership;

  useGroupPageTitle(groupId, "Tournaments");
  const getItem = React.useCallback(() => ({
    text: "Tournaments", 
    url: urlFor("GROUP_TOURNAMENTS", {groupId}), 
    isName: false
  }), [groupId]);
  useNavbarItem(getItem);

  // fetch tournaments array on page mount
  const fetchFunc = React.useCallback(async () => await api.getCommunityTournaments(groupId), [groupId])
  const [tournaments, setTournaments] = useFetchedListOfItems(fetchFunc);
  
  // views and handlers
  const {
    editedItemId: editedTournamentId,
    setEditedItemId: setEditedTournamentId,
    handleItemUpdated: handleTournamentUpdated,
    handleItemDeleted: handleTournamentDeleted,
  } = useListUpdateDeleteViews(tournaments, setTournaments);

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
            <h3 className="heading heading--2">
              Tournament List
            </h3>
            <FilterTabs 
              filters={ filters } 
              activeFilter={ activeFilter } 
              onSelectFilter={ setActiveFilter } 
            />
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