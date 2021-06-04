import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import BasePage from 'pages/BasePage';
import LoginPage from 'pages/LoginPage';
import HomePage from 'pages/HomePage';
import MyCommunities from './MyCommunities';

import { selectCurrentUser } from 'state/authSlice';
import urlFor from 'urls';

import 'styles/_reset.scss';


const App = () => {
  
  const user = useSelector(selectCurrentUser);

  return (
    <BasePage>
      <Switch>
        <Route exact path={ urlFor('LOGIN') } component={ LoginPage } />
        <Route path="/" render={
            () => user ? <MyCommunities /> : <HomePage />
          } 
        />
      </Switch>
    </BasePage>
  )
}

export default App;