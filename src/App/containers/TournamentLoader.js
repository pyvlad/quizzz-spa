import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  fetchTournament, 
  selectActiveTournamentId,
  selectTournamentStatus, 
  showLoadingOverlay, 
  hideLoadingOverlay 
} from 'state';


const TournamentLoader = ({ children }) => {
  /*
    This component ensures that the active tournament 
    has been fetched and can be accessed by child components.
  */
  const dispatch = useDispatch();
  const status = useSelector(selectTournamentStatus);
  const activeId = useSelector(selectActiveTournamentId);

  React.useEffect(() => {
    if (activeId) {
      if (status === 'idle') {
        dispatch(fetchTournament(activeId));
      } else if (status === 'loading') {
        dispatch(showLoadingOverlay());
      } else {
        dispatch(hideLoadingOverlay());
      }
    }
  }, [dispatch, status, activeId]);

  switch (status) {
    case 'idle':
      return ''
    case 'loading':
      return 'Loading data. Please, wait...'
    case 'failed':
      return 'Could not load the data. Please try again later.'
    case 'ok':
      return children;
    default:
      throw new Error("Unsupported loading status.")
  }
}

export default TournamentLoader;