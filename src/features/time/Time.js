import React from 'react';

import { client as apiClient } from 'api/client';


const Time = () => {
  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    apiClient
      .get('/api/time/')
      .then(data => setCurrentTime(data['time']));
  }, []);

  const output = (currentTime)
    ? <p>The current time is {(new Date(currentTime)).toTimeString()}.</p>
    : <p>Could not fetch current time.</p>

  return output;
}

export default Time;