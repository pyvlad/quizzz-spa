import { Provider } from 'react-redux';
import store from './store';

import { Auth } from 'features/auth';
import { Time } from 'features/time';


const MyApp = () => (
  <Provider store={ store }>
    <Auth>
      <Time />
    </Auth>
  </Provider>
)

export default MyApp;