/*
  This component renders correct page for anonymous users based on the url.
*/
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import HomePage from 'pages/HomePage';
import LoginPage from 'pages/auth/LoginPage';
import RegisterPage from 'pages/auth/RegisterPage';
import RequestResetPage  from 'pages/auth/RequestResetPage';
import PasswordResetPage from 'pages/auth/PasswordResetPage';


const HomeAndAuth = () => (
  <Switch>
    <Route exact path="/" component={ HomePage } />
    <Route exact path="/auth/login/" component={ LoginPage } />
    <Route exact path="/auth/register/" component={ RegisterPage } />
    <Route exact path="/auth/request-password-reset/" component={ RequestResetPage } />
    <Route exact 
      path="/auth/password-reset/:token_uuid/"
      render={({match}) => <PasswordResetPage tokenUUID={match.params.token_uuid} />} 
    />
    <Redirect to="/" />
  </Switch>
)

export default HomeAndAuth;