import React from 'react';

import logo from 'media/logo.svg';
import './Logo.scss';
import 'styles/spacing.scss';


const Logo = () => (
  <a href="/" className="logo">
    <img className="logo__image mr-2" src={logo} alt="Cat-like Logo" />
    <h1 className="logo__text">Quizzz</h1>
  </a>
)

export default Logo;