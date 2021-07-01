import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectCurrentUser, fetchLogout } from 'state';
import urlFor from 'urls';

import './Menu.scss';


const Menu = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleLogout = (event) => {
    event.preventDefault();
    dispatch(fetchLogout());
  }

  return (
    <nav className="menu">
      <div className="menu__item menu__item--username">
        { user ? user.username : 'Welcome!'}
      </div>
      <div>
        {
          user
          ? <button 
              onClick={ handleLogout }
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
}

export default Menu;