import { useSelector } from 'react-redux';

import { selectCurrentUser } from 'state';


const Authentication = ({ componentIfAuthenticated, componentIfAnonymous }) => {
  /*
    This component ensures that the user is authenticated before 
    rendering any child components.
  */
  const user = useSelector(selectCurrentUser);
  
  return user ? componentIfAuthenticated : componentIfAnonymous;
}

export default Authentication;