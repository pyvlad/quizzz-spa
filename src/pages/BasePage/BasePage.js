import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import Messages from './Messages';
import Menu from './Menu/Menu';
import Logo from './Logo/Logo';
import { LoadingOverlay } from 'common/Loading';
import { 
  selectIsLoading, selectCurrentUser, logCurrentUserOut, 
  showMessage, selectNavbarItems 
} from 'state';
import * as api from 'api';
import useSubmit from 'common/useSubmit';

import './BasePage.scss';


const BasePage = ({ children }) => {
  
  // globals
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsLoading);
  const navbarItems = useSelector(selectNavbarItems);

  // submission state
  const { errorMessage, handleSubmit: handleLogout } = useSubmit(
    async () => await api.logout(),
    user => {
      dispatch(showMessage('Goodbye.', 'info'));
      dispatch(logCurrentUserOut());
    }
  );

  // show error message
  React.useEffect(() => {
    if (errorMessage) {
      dispatch(showMessage(errorMessage, 'error'))
    }
  }, [errorMessage, dispatch])

  // component
  return <div className="page">

    { isLoading ? <LoadingOverlay /> : null }

    <header className="page__section page__section--header">
      <div className="container-fluid-lg px-2 py-1">
        <div className="header">
          <Logo />
          <Menu user={ user } onLogoutClick={ handleLogout } />
        </div>
      </div>
    </header>

    { 
      navbarItems.length 
      ? <section className="page_section page__section--navbar">
         <div className="container-fluid-lg px-2 py-2">
          <header className="navbar">
            {
              navbarItems.map((item, i) => {
                const { text, url, isName } = item;
                return (
                  <Link 
                    to={ url }
                    key={ i }
                    className={`navbar__item ${isName ? "navbar__item--name" : ""}`}
                  >
                    { text }
                  </Link>
                );
              })
            }
          </header>
         </div>
        </section>
      : null 
    }

    <section className="page__section page__section--main">
      <Messages />
      <div className="container-fluid-lg px-2">
        <section className="my-3">
          { children }
        </section>
      </div>
    </section>

    <footer className="page__section page__section--footer">
      <div className="container-fluid-lg px-2">
        <div className="py-2">
          <p>(c) 2021</p>
        </div>
      </div>
    </footer>
  </div>
}

export default BasePage;