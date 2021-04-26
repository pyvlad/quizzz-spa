import React from 'react';

import { fetchCurrentUser } from 'api';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm';


const Auth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    fetchCurrentUser()
      .then(({status, data}) => {
        if (status === 200) {
          setIsAuthenticated(true);
          setUser(data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      })
  }, [isAuthenticated]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  const handleFail = () => alert("Fail!");

  return (
    <div>
      <p>{ user ? `Hello, ${user.username}!` : 'Welcome to the website!' }</p>
      { 
        user 
        ? <div>
            <LogoutForm onSuccess={ handleLogout } onFail={ handleFail } />
            { children }
          </div>
        : <div>
            <p>Please log in.</p>
            <LoginForm onSuccess={ handleLogin } onFail={ handleFail } />
          </div>
      }
    </div>
  )
}

export default Auth;