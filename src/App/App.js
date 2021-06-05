import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Authentication from './containers/Authentication';

import BasePage from 'pages/BasePage';
import LoginPage from 'pages/LoginPage';
import HomePage from 'pages/HomePage';

import MyGroups from './MyGroups';

import urlFor from 'urls';

import './Styles.js';


const App = () => (
  <BasePage>
    <Switch>
      <Route exact path={ urlFor('LOGIN') } component={ LoginPage } />
      <Route path="/" render={ 
        () => <Authentication 
          componentIfAuthenticated={ <MyGroups /> }
          componentIfAnonymous={ <HomePage /> }
        />
      }/>
    </Switch>
  </BasePage>
)

export default App;