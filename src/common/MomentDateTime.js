import React from 'react';
import moment from 'moment';


const getValue = (timestamp, func, format) => {
  /*
    Return formatted timestamp by calling one of momentjs functions
    with optionally specified format, e.g.:
    - when func="format" and format is supplied, it's `moment(timestamp).format(format)`
    - when func="fromNow" and format is undefined, it's `moment(timestamp).fromNow()`

    For the list of functions and formats, see: https://momentjs.com/docs/#/displaying/
  */
  const obj = moment(timestamp); 
  const args = [];
  if (format) args.push(format);
  // The apply() method calls a function `obj[func]` 
  // with a given `this` value, and arguments provided as an array:
  return obj[func].apply(obj, args);
}


const MomentDateTime = ({
    timestamp,            // string
    func="fromNow",       // e.g. "fromNow"
    format,               // e.g. "MMM D, YYYY [at] h:mm a"
    refresh=10000         // e.g. 10000 (=10 seconds)
}) => {

  const [value, setValue] = React.useState(getValue(timestamp, func, format));

  React.useEffect(() => {
    if (refresh) {
      const timer = setInterval(() => {
        setValue(getValue(timestamp, func, format));
      }, refresh);
      return () => clearInterval(timer);
    }
  }, [setValue, timestamp, func, format, refresh])

  return value;
}

export default MomentDateTime;