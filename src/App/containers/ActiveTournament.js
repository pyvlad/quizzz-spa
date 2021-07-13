import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveTournamentId, setActiveTournamentId } from 'state';


const ActiveTournament = ({ id, children }) => {
  /*
    This component ensures that the active tournament id has been set
    and can be used by child components.
  */
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveTournamentId);

  React.useEffect(() => {
    if (activeId !== id) {
      dispatch(setActiveTournamentId(id));
    }
  }, [dispatch, activeId, id]);

  return (id === activeId) ? children : null;
}

export default ActiveTournament;