import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMyMemberships, selectMyCommunitiesStatus } from './slice';


const MyCommunitiesLoader = ({ children }) => {
  const dispatch = useDispatch();
  const status = useSelector(selectMyCommunitiesStatus);

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

export default MyCommunitiesLoader;