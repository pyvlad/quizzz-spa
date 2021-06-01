import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import './Menu.scss';
import { selectCurrentUser, fetchLogout } from 'state/authSlice';
import urlFor from 'urls';


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
          ? <form onSubmit={ handleLogout }>
              <input type="submit" value="Logout" className="menu__item menu__item--link" />
            </form>
          : <Link to={ urlFor('LOGIN') } className="menu__item menu__item--link">
              Login
            </Link>
        }
      </div>
    </nav>
  )
}

export default Menu;