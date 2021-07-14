import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  fetchTournament, selectActiveTournamentId, selectTournamentStatus, 
  selectTournamentError, showLoadingOverlay, hideLoadingOverlay, showMessage,
} from 'state';


const TournamentLoader = ({ children }) => {
  /*
    This component ensures that the active tournament 
    has been fetched and can be accessed by child components.
  */
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveTournamentId);
  const status = useSelector(selectTournamentStatus);
  const errorMessage = useSelector(selectTournamentError);

  React.useEffect(() => {
    if (activeId) {
      if (status === 'idle') {
        dispatch(fetchTournament(activeId));
      } else if (status === 'loading') {
        dispatch(showLoadingOverlay());
      }

      if ((status === 'failed') && errorMessage) {
        dispatch(showMessage(errorMessage));
      }
  
      if ((status === 'failed') || (status === 'ok')) {
        dispatch(hideLoadingOverlay());
      }
    }
  }, [dispatch, activeId, status, errorMessage]);

  switch (status) {
    case 'idle':
      return ''
    case 'loading':
      return 'Loading tournament data. Please, wait...'
    case 'failed':
      return (
        <div>
          <p>Tournament data could not be loaded.</p>
          <p>Please reload the page or try again later.</p>
        </div>
      )
    case 'ok':
      return children;
    default:
      throw new Error("Unsupported loading status.")
  }
}

export default TournamentLoader;