import React from 'react';

import './home-logo.scss';
import logo from 'media/logo.svg';


const Home = () => (
  <div className="container bg-grey">
    <div className="row">
      <div className="col-sm-8 col-sm-offset-2">
        <div className="container">
          <div className="row">
            <div className="col-xs-8 p-4">
              <p className="heading--1">
                Welcome to Quizzz!
              </p>
              <p className="heading--2 pt-3">
                Quizzz is a website to play self-made quizzes with people you know.
              </p>
            </div>
            <div className="col-xs-4 p-4">
              <img src={ logo } className="logo-home-page" alt="Cat-like Logo" />
            </div>
          </div>
        </div>
        <ol className="m-4 px-4">
          <li className="my-2">
            Set up an account and log in to the website.
          </li>
          <li className="my-2">
            Create a group and tell its name to other people to join the group. 
            Or, if someone has sent you an existing group's name, use it to join the group.
          </li>
          <li className="my-2">
            Within a group, each group member can create quizzes and submit 
            to group admins for use in tournaments.
          </li>
          <li className="my-2">
            Group admins can set up quiz tournaments and schedule quizzes 
            submitted by group members as tournament rounds.
          </li>
          <li className="my-2">
            Group members can play quizzes submitted by others, view round and 
            tournament standings, and discuss each quiz only with people who already took it.
          </li>
        </ol>
      </div>
    </div>
  </div>
)

export default Home;