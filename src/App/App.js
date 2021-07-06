import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'state';

import BasePage from 'pages/BasePage';
import HomeAndAuth from './HomeAndAuth';
import MyGroups from './MyGroups';
import EmailConfirmationPage from 'pages/auth/EmailConfirmationPage';
import EmailNotConfirmedPage from 'pages/auth/EmailNotConfirmedPage';

import './Styles.js';


const App = () => {

  const user = useSelector(selectCurrentUser);

  return (
    <BasePage>
      <Switch>
        <Route exact 
          path="/auth/confirm-email/:token/" 
          render={({match}) => <EmailConfirmationPage 
            token={ match.params.token } isLoggedIn={!!user} />}
        />
        <Route path="/" component={ 
          user 
          ? (user.is_email_confirmed ? MyGroups : EmailNotConfirmedPage ) 
          : HomeAndAuth
        } />
      </Switch>
    </BasePage>
  )
}

export default App;