import React from 'react';
import { useSelector } from 'react-redux';

import { selectCurrentUser } from 'features/auth/authSlice';
import Home from 'features/home/Home';
import MyCommunities from 'features/myCommunities/MyCommunities';


const Content = () => {
  const user = useSelector(selectCurrentUser);

  return user
    ? <MyCommunities />
    : <Home />
}

export default Content;
