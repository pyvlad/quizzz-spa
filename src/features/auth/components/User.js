import React from 'react';


const User = ({ user }) => (
  <p>
    { 
      user 
      ? `Hello, ${user.username}!` 
      : 'Welcome to the website!' 
    }
  </p>
)

export default User;