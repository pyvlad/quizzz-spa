import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId } from 'state';
import { selectMyMembershipByGroupId } from 'state';
import * as api from 'api';

import RoundsTable from './Table';
import FormWrapper from './FormWrapper';
import EditRoundForm from './EditRoundForm';
import DeleteRoundButton from './DeleteRoundButton';
import FilterTabs from 'common/FilterTabs';
import { useFetchedListOfItems } from 'common/useApi';
import useListUpdateDeleteViews from 'common/useListUpdateDeleteViews';
import { useGroupPageTitle } from 'common/useTitle';


const TournamentRoundsPage = () => {

  // page parameters
  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);
  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const { is_admin: loggedAsGroupAdmin } = membership;

  useGroupPageTitle(groupId, "Tournament Rounds");

  // fetch array of rounds on page component mount
  const fetchFunc = React.useCallback(
    async () => await api.getTournamentRounds(groupId, tournamentId), 
    [groupId, tournamentId]
  )
  const [rounds, setRounds] = useFetchedListOfItems(fetchFunc);

  // page views and handlers
  const {
    editedItemId: editedRoundId,
    setEditedItemId: setEditedRoundId,
    handleItemUpdated: handleRoundUpdated,
    handleItemDeleted: handleRoundDeleted,
  } = useListUpdateDeleteViews(rounds, setRounds);

  // FILTERS
  // define filters
  const filters = ["current", "finished", "coming", "all"];
  const [activeFilter, setActiveFilter] = React.useState("current");

  // apply current filter
  let rows = [...rounds];
  if (activeFilter === "current") {
    rows = rows.filter(r => r.status === "current")
  } else if (activeFilter === "finished") {
    rows = rows.filter(r => r.status === "finished");
  } else if (activeFilter === "coming") {
    rows = rows.filter(r => r.status === "coming");
  }

  return (
    <div>
      <h2 className="heading heading--1">
        Tournament Rounds
      </h2>
      {
        (editedRoundId !== null)
        ? <div>
            <button onClick={() => setEditedRoundId(null)} 
              className="btn btn--grey btn--mw150">⏎ back</button>
            <FormWrapper>
              <EditRoundForm
                round={ rounds.find(item => item.id === editedRoundId) } 
                onRoundUpdate={ item => handleRoundUpdated(item) }
                tournamentId={ tournamentId }
              />
              {
                editedRoundId 
                ? <DeleteRoundButton
                  round={ rounds.find(item => item.id === editedRoundId) }
                  onRoundDelete={ () => handleRoundDeleted(editedRoundId) }
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
                  onClick={ () => setEditedRoundId(0) }
                >
                  Create Round
                </button>
              : null
            }
            <h3 className="heading heading--2">
              Round List
            </h3>
            <FilterTabs 
              filters={ filters } 
              activeFilter={ activeFilter } 
              onSelectFilter={ setActiveFilter } 
            />
            <RoundsTable 
              rounds={ rows } 
              loggedAsGroupAdmin={ loggedAsGroupAdmin } 
              onEditRound={ roundId => setEditedRoundId(roundId) }
            />
          </div>
      }
    </div>
  )
}

export default TournamentRoundsPage;