import { Provider } from 'react-redux';
import store from './store';

import Page from 'features/page/Page';
import { Auth } from 'features/auth';
import { Time } from 'features/time';


const App = () => (
  <Provider store={ store }>
    <Page>    
      <Auth>
        <Time />
      </Auth>
    </Page>
  </Provider>
)

export default App;