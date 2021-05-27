import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import BasePage from 'features/base/BasePage';
import LoginPage from 'features/auth/LoginPage';
import HomePage from 'features/home/HomePage';
import AppContent from './AppContent';

import { selectCurrentUser } from 'features/auth/authSlice';
import urlFor from 'urls';

import './styles/_reset.scss';


const App = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <BasePage>
      <Switch>
        <Route exact path={ urlFor('LOGIN') } component={ LoginPage } />
        <Route path="/" render={
            () => user ? <AppContent /> : <HomePage />
          } 
        />
      </Switch>
    </BasePage>
  )
}

export default App;