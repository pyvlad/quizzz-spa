import React from 'react';
import moment from 'moment';


const MomentDateTime = ({
    timestamp,            // string
    func="fromNow",       // e.g. "fromNow"
    format,               // e.g. "MMM D, YYYY [at] h:mm a"
    refresh=10000         // e.g. 10000 (=10 seconds)
}) => {

  const getValue = () => {
    const obj = moment(timestamp);
    const args = [];
    if (format) args.push(format);
    return obj[func].apply(obj, args);
  }

  const [value, setValue] = React.useState(getValue());

  React.useEffect(() => {
    if (refresh) {
      const timer = setInterval(() => {
        const newValue = getValue();
        console.log("setting new value", newValue)
        setValue(newValue);
      }, refresh);
      return () => clearInterval(timer);
    }
  }, [refresh, setValue, getValue])

  return value;
}

export default MomentDateTime;