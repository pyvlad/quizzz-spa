/*
Hook to asynchronously fetch list of items on component mount.

Anynchronous fetch function passed as argument is wrapped in an IIFE 
in the useEffect hook to add error handling and loading state.

`asyncFetchFunc` must return either an array of objects (on success) 
or throw an error-like object with a `.message` string property 
to show to the user (when request fails).

Make sure to wrap the fetch function in the `useCallback` hook before 
passing as argument to avoid infinite re-rendering loop.
*/
import React from 'react';

import { useDispatch } from 'react-redux';
import { showMessage, showLoadingOverlay, hideLoadingOverlay } from 'state';


const useFetchedListOfItems = (asyncFetchFunc) => {
  
  const dispatch = useDispatch();
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    
    (async function() {
      
      dispatch(showLoadingOverlay());

      let success = false;
      let data = null;

      try {
        data = await asyncFetchFunc();
        success = true;
      } catch(err) {
        dispatch(hideLoadingOverlay());
        dispatch(showMessage(`Could not load data. Reason: ${err.message}`, 'error'));
      }

      if (success) {
        setItems(data);
        dispatch(hideLoadingOverlay());
      }
    })();

  }, [dispatch, setItems, asyncFetchFunc])

  return [items, setItems];
}

export default useFetchedListOfItems;