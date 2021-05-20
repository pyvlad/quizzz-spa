import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import MyCommunitiesList from './List/List';
import JoinCommunityForm from './forms/JoinCommunityForm';
import CreateCommunityForm from './forms/CreateCommunityForm';
import SingleCommunity from './SingleCommunity';


const Content = () => (
  <Switch>
    <Route path="/" exact component={ MyCommunitiesList } />
    <Route path="/join" exact component={ JoinCommunityForm } />
    <Route path='/create' exact component={ CreateCommunityForm } />
    <Route path='/edit/:id' 
      render={ 
        props => {
          const id = parseInt(props.match.params.id);
          return <CreateCommunityForm communityId={ id } />
        }
      } 
    />
    <Route path='/:id' 
      render={ 
        props => {
          const id = parseInt(props.match.params.id);
          return <SingleCommunity communityId={ id } />
        }
      } 
    />
    <Redirect to="/" />
  </Switch>
);

export default Content;