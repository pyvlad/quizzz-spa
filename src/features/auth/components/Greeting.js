import React from 'react';


const Greeting = ({ user }) => {
  return <p>
    { 
      user 
      ? `Hello, ${user.username}!` 
      : 'Welcome to the website!' 
    }
  </p>
}

export default Greeting;