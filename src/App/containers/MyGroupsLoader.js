import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { 
  fetchMyMemberships, selectMyGroupsStatus, selectMyGroupsError,
  showLoadingOverlay, hideLoadingOverlay, showMessage,
} from 'state';



const MyGroupsLoader = ({ children }) => {
  /*
    This component ensures that user's group membership data 
    has been fetched and can be accessed by child components.
  */
  const dispatch = useDispatch();
  const status = useSelector(selectMyGroupsStatus);
  const errorMessage = useSelector(selectMyGroupsError);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMyMemberships())
    } else if (status === 'loading') {
      dispatch(showLoadingOverlay())
    }

    if ((status === 'failed') && errorMessage) {
      dispatch(showMessage(errorMessage));
    }

    if ((status === 'failed') || (status === 'ok')) {
      dispatch(hideLoadingOverlay());
    }
  }, [dispatch, status, errorMessage]);

  switch (status) {
    case 'idle':
      return ''
    case 'loading':
      return 'Loading group data. Please, wait...'
    case 'failed':
      return (
        <div>
          <p>Group data could not be loaded.</p>
          <p>Please reload the page or try again later.</p>
        </div>
      )
    case 'ok':
      return children;
    default:
      throw new Error("Unsupported loading status.")
  }
}

export default MyGroupsLoader;