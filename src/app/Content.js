import React from 'react';
import { useSelector } from 'react-redux';

import { selectCurrentUser } from 'features/auth/authSlice';
import Home from 'features/home/Home';
import GroupsPage from 'features/groups/GroupsPage';


const Content = () => {
  const user = useSelector(selectCurrentUser);

  return user
    ? <GroupsPage />
    : <Home />
}

export default Content;
