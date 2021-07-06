import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAlert as useReactAlert } from 'react-alert';

import { removeMessage, selectMessages } from 'state';


const Messages = () => {

  const messages = useSelector(selectMessages);
  const alert = useReactAlert();
  const dispatch = useDispatch();

  React.useEffect(() => {
    const items = [...messages];
    items.forEach(item => {
      alert.show(
        item.message, 
        {
          type: item.type, 
          timeout: item.timeout,
        }
      );
      dispatch(removeMessage(item.id));
    })
  }, [messages, dispatch, alert])

  return null;
}

export default Messages;