import React from 'react';

import { fetchCurrentTime } from './api';


const Time = () => {
  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    fetchCurrentTime()
      .then(({ data }) => setCurrentTime(data['time']));
  }, []);

  return <p>The current time is {(new Date(currentTime)).toTimeString()}.</p>;
}

export default Time;