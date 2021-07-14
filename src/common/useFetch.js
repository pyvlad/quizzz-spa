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


export const useFetch = (asyncFetchFunc, initValue=null) => {

  const dispatch = useDispatch();
  const [data, setData] = React.useState(initValue);

  React.useEffect(() => {
    
    (async function() {
      
      dispatch(showLoadingOverlay());

      let success = false;
      let fetchedData = null;

      try {
        fetchedData = await asyncFetchFunc();
        success = true;
      } catch(err) {
        dispatch(hideLoadingOverlay());
        dispatch(showMessage(`Could not load data. Reason: ${err.message}`, 'error'));
      }

      if (success) {
        setData(fetchedData);
        dispatch(hideLoadingOverlay());
      }
    })();

  }, [dispatch, setData, asyncFetchFunc])

  return [data, setData];
}


export const useFetchedListOfItems = (asyncFetchFunc) => {
  const [items, setItems] = useFetch(asyncFetchFunc, []);
  return [items, setItems];
}