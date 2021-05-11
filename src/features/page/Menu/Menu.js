import React from 'react';
import { useSelector } from 'react-redux';

import './Menu.scss';
import { selectCurrentUser } from 'features/auth/authSlice';


const Menu = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <nav className="menu">
      <div className="menu__item menu__item--username">
        { user ? user.username : 'Welcome!'}
      </div>
    </nav>
  )
}

export default Menu;