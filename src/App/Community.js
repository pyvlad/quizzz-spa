import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import { setActiveCommunityId, selectActiveCommunityId } from 'state/communitySlice';

import CommunityPage from 'pages/community/CommunityPage';
import MembersPage from 'pages/community/MembersPage';
import MyQuizzesPage from 'pages/community/MyQuizzesPage';
import ChatPage from 'pages/community/ChatPage';


export const ActiveCommunity = ({ id, children }) => {
  /* 
    This component ensures that active communityId corresponds to the URL 
    and can be selected down the component tree from the Redux store.
  */
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveCommunityId);

  useEffect(() => {
      dispatch(setActiveCommunityId(id));
  }, [id, dispatch]);

  return (id === activeId) ? children : null;
}


const Community = () => {
  /*
    This component renders correct page based on the url.
  */
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/`} component={ CommunityPage }/>
      <Route exact path={`${path}/members/`} component={ MembersPage }/>
      <Route exact path={`${path}/my-quizzes/`} component={ MyQuizzesPage }/>
      <Route exact path={`${path}/chat/`} component={ ChatPage }/>
      <Redirect to={`${path}/`} />
    </Switch>
  )
}

export default Community;