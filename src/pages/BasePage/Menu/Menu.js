import React from 'react';
import { Link } from 'react-router-dom';

import urlFor from 'urls';

import './Menu.scss';


const Menu = ({ user, onLogoutClick }) => (
  <nav className="menu">
    <div className="menu__item menu__item--username">
      { user ? user.username : 'Welcome!'}
    </div>
    <div>
      {
        user
        ? <button 
            onClick={ onLogoutClick }
            className="menu__item menu__item--link" 
          >
            Logout
          </button>
        : <React.Fragment>
            <Link 
              to={ urlFor('REGISTER') } 
              className="menu__item menu__item--link"
            >
              Register
            </Link>
            <Link 
              to={ urlFor('LOGIN') } 
              className="menu__item menu__item--link"
            >
              Login
            </Link>
          </React.Fragment>
      }
    </div>
  </nav>
)

export default Menu;