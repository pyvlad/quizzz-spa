import React from 'react';

import urlFor from 'urls';

import logo from 'media/logo.svg';
import './Logo.scss';


const Logo = () => (
  <a href={ urlFor('HOME') } className="logo">
    <img src={ logo } 
      className="logo__image mr-2"  
      alt="Cat-like Logo" 
    />
    <h1 className="logo__text">
      Quizzz
    </h1>
  </a>
)

export default Logo;