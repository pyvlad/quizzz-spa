import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import store from './state/store';
import App from './App';

const options = { position: positions.BOTTOM_RIGHT };


ReactDOM.render(
  <React.StrictMode>
    <Provider store={ store }>
      <AlertProvider template={ AlertTemplate } options={ options }>
        <Router>
          <App/>
        </Router>
      </AlertProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);