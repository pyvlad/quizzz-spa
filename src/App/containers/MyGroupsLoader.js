import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMyMemberships, selectMyGroupsStatus } from 'state';


const MyGroupsLoader = ({ children }) => {
  /*
    This component ensures that user's group membership data 
    has been fetched and can be accessed by child components.
  */
  const dispatch = useDispatch();
  const status = useSelector(selectMyGroupsStatus);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMyMemberships())
    }
  }, [dispatch, status]);

  switch (status) {
    case 'idle':
      return ''
    case 'loading':
      return 'Please, wait...'
    case 'failed':
      return 'Could not load the data. Please try again later.'
    case 'ok':
      return children;
    default:
      throw new Error("Unsupported loading status.")
  }
}

export default MyGroupsLoader;