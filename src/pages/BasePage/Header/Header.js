import React from 'react';

import Logo from '../Logo/Logo';
import Menu from '../Menu/Menu';
import './Header.scss';


const Header = () => {
  return (
    <div className="header">
      <Logo />
      <Menu />
    </div>
  )
}

export default Header;