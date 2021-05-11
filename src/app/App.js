import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import store from './store';
import BasePage from 'features/base/BasePage';
import Login from 'features/auth/Login';
import Content from 'features/content/Content';


const App = () => (
  <Provider store={ store }>
    <Router>
      <BasePage>
        <Switch>
          <Route exact path="/login/" component={ Login } />
          <Route exact path="/" component={ Content } />
          <Redirect to="/" />
        </Switch>
      </BasePage>
    </Router>
  </Provider>
)

export default App;