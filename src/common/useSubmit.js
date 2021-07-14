import React from 'react';
import { useDispatch } from 'react-redux';
import { showMessage, showLoadingOverlay, hideLoadingOverlay } from 'state';


const initialState = {
  isLoading: false,
  statusCode: null,
  errorMessage: null,
  formErrors: null,
};


function reducer(state, action) {
  switch (action.type) {
    case 'startRequest':
      return {
        formErrors: state.formErrors, // keep former errors visible behind overlay
        statusCode: null, 
        errorMessage: null, 
        isLoading: true
      };
    case 'requestSuccess':
      return {
        ...state, 
        formErrors: null,
        isLoading: false,
      };
    case 'requestFail':
      const { error } = action.payload;
      return {
        isLoading: false,
        statusCode: error.status ? error.status : null,
        errorMessage: error.message ? error.message : null,
        formErrors: error.formErrors ? error.formErrors : null,
      };
    case 'resetSubmissionState':
      return initialState;
    default:
      throw new Error();
  }
}


const useSubmit = (asyncSubmitFunction, onSuccess, withLoadingOverlay=true) => {
  /*
    Hook that wraps form / data submission.

    Arguments:
    - `asyncSubmitFunction`: asynchronous function that should be called 
      when the user submits the form/data;
    - `onSuccess`: callback that is called if no errors were catched 
      during the asyncSubmitFunction call.

    Returns:
    - `handleSubmit` function to handle form/data submission;
    - `isLoading` status that is set to true for the duration of `handleSubmit` call;
    - `errors` object with a mandatory `message` property and an optional `formErrors` 
      property (see 'client.js' in 'api' for details of error handling)
  */
  const reduxDispatch = useDispatch();

  // state
  const [state, localDispatch] = React.useReducer(reducer, initialState);
  const { isLoading, statusCode, errorMessage, formErrors } = state;

  // callback
  const fetchFunc = React.useCallback(async () => {

    let success = false;
    let responseData = null;

    if (withLoadingOverlay) reduxDispatch(showLoadingOverlay());
    localDispatch({type: 'startRequest'});
    
    try {
      responseData = await asyncSubmitFunction();
      success = true;
    } catch(error) {
      if (withLoadingOverlay) reduxDispatch(hideLoadingOverlay());
      localDispatch({type: 'requestFail', payload: { error }})
    }

    if (success) {
      if (withLoadingOverlay) reduxDispatch(hideLoadingOverlay());
      localDispatch({type: 'requestSuccess'});
    }

    return {responseData, success};

  }, [reduxDispatch, localDispatch, asyncSubmitFunction, withLoadingOverlay])


  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoading) {
      const {responseData, success} = await fetchFunc();
      if (onSuccess && success) {
        onSuccess(responseData);
      }
    }
  }

  // show error message when a request fails and does not contain formErrors
  React.useEffect(() => {
    if (errorMessage && !formErrors) {
      reduxDispatch(showMessage(errorMessage, 'error'));
    }
    if (Array.isArray(formErrors)) {
      formErrors.forEach(msg => reduxDispatch(showMessage(msg, 'error')));
    }
  }, [errorMessage, formErrors, reduxDispatch]);

  // return
  // NOTE: currently statusCode is returned only when `apiError` happens (non 200-299)
  return { 
    isLoading, 
    statusCode, 
    errorMessage, 
    formErrors,
    fetchFunc,
    handleSubmit, 
    resetSubmissionState: () => localDispatch({type: 'resetSubmissionState'})
  };
}

export default useSubmit;