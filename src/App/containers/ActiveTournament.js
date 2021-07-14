import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveTournamentId, setActiveTournamentId } from 'state';


const ActiveTournament = ({ urlTournamentId, children }) => {
  /*
    This component ensures that:
    - `tournament.activeId` is available in the Redux store for child components;
    - `tournament.activeId` corresponds to the URL;
  */
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveTournamentId);

  React.useEffect(() => {
    dispatch(setActiveTournamentId(urlTournamentId));
  }, [dispatch, urlTournamentId]);

  return (urlTournamentId === activeId) ? children : null;
}

export default ActiveTournament;