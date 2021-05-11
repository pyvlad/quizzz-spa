import React from 'react';

import Header from './Header/Header';
import Message from './Message/Message';

import './BasePage.scss';

import 'styles/grid.scss';
import 'styles/spacing.scss';


const BasePage = ({ children }) => (
  <div className="page">
    <header className="page__section page__section--header">
      <div className="container-fluid-lg px-2 py-1">
        <Header />
      </div>
    </header>

    <section className="page__section page__section--main">
      <div className="container-fluid-lg px-2">
        <section className="my-3">
          <Message />
        </section>
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
)

export default BasePage;