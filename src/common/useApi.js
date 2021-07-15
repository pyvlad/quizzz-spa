/*
Hook that wraps API calls adding error handling and loading state.

`asyncApiFunc`: 
  asynchronous API function to be called without parameters; on error, 
  it must throw  an error-like object with a `.message` sting property.
  Make sure to wrap the fetch function in the `useCallback` hook before 
  passing as argument to avoid infinite re-rendering loop.
`params`:     
  `withLoadingOverlay` [false], 
  `onSubmitSuccess` [null]:
      callback that is called by `handleSubmit` if no errors were catched 
      during the asyncApiFunc call; it receives `responseData` as argument.
  `fetchOnMount` [false],
  `showErrorMessage` [true],
  `showArrayMessages` [true].

  Returns:
  - `data` [null]:
      initially - `null`, then set to API call response body;
  - `isLoading` [false]:
      status that is set to true for the duration of the API call;
  - `statusCode` [null]:
      response status code when `apiError` happens (non 200-299);
  - `errorMessage` [null]:
      value of `err.message` when API call does not succeed;
  - `formErrors` [null]:
      value of `err.formErrors` when `apiError` happens (non 200-299)
      it is either a list of generic serializer.ValidationError strings
      raised by the backend or a dict where ValidationError string 
      are grouped by field name (potentially nested); 
  - `fetchFunc`:
      wrapper around `asyncApiFunc` wrapper with loading state, 
      error state, and (optional) global overlay
  - `handleSubmit`:
      function to perform initiate form/data submission 
      (takes `event` as argument);
  - `setData`:
      function to manually set `data` without any API calls;
      use it when you need to update already received data 
      (e.g. add/update/delete array item); 
  - `resetSubmissionState`:
      function to reset state to initial.
*/
import React from 'react';
import { useDispatch } from 'react-redux';
import { showMessage, showLoadingOverlay, hideLoadingOverlay } from 'state';


const initialState = {
  data: null,
  isLoading: false,
  statusCode: null,
  errorMessage: null,
  formErrors: null,
};


function reducer(state, action) {
  switch (action.type) {
    case 'startRequest': {
      return {
        // keep former data and errors visible behind overlay
        data: state.data,
        formErrors: state.formErrors,
        statusCode: null, 
        errorMessage: null, 
        isLoading: true
      };
    }
    case 'requestSuccess': {
      const newData = action.payload;
      return {
        ...state,
        data: newData,
        formErrors: null,
        isLoading: false,
      };
    }
    case 'requestFail': {
      const { error } = action.payload;
      return {
        data: null,
        isLoading: false,
        statusCode: error.status ? error.status : null,
        errorMessage: error.message ? error.message : null,
        formErrors: error.formErrors ? error.formErrors : null,
      };
    }
    case 'setData': {
      const newData = action.payload;
      return {
        ...state,
        data: newData,
      }
    }
    case 'resetSubmissionState': {
      return initialState;
    }
    default:
      throw new Error();
  }
}


const useApi = (
  asyncApiFunc, 
  {
    withLoadingOverlay=false, 
    onSubmitSuccess=null, 
    fetchOnMount=false,
    showErrorMessage=true,
    showArrayMessages=true,
  }={}
) => {

  const reduxDispatch = useDispatch();

  // state
  const [state, localDispatch] = React.useReducer(reducer, initialState);
  const { data, isLoading, statusCode, errorMessage, formErrors } = state;


  // `asyncApiFunc` wrapper with loading state, error state, 
  // and (optional) global overlay
  const fetchFunc = React.useCallback(async () => {

    let success = false;
    let responseData = null;

    if (withLoadingOverlay) reduxDispatch(showLoadingOverlay());
    localDispatch({type: 'startRequest'});
    
    try {
      responseData = await asyncApiFunc();
      success = true;
    } catch(error) {
      if (withLoadingOverlay) reduxDispatch(hideLoadingOverlay());
      localDispatch({type: 'requestFail', payload: { error }})
    }

    if (success) {
      if (withLoadingOverlay) reduxDispatch(hideLoadingOverlay());
      localDispatch({type: 'requestSuccess', payload: responseData});
    }

    return {responseData, success};

  }, [reduxDispatch, localDispatch, asyncApiFunc, withLoadingOverlay]);


  // ERRORS
  // when the formErrors are an array - that was caused by 
  // a generic `raise serializers.ValidationError` - show them all:
  React.useEffect(() => {
    if (Array.isArray(formErrors) && showArrayMessages) {
      formErrors.forEach(msg => reduxDispatch(showMessage(msg, 'error')));
    }
  }, [reduxDispatch, formErrors, showArrayMessages]);


  // when there are no formErrors, show the message:
  React.useEffect(() => {
    if (errorMessage && !formErrors && showErrorMessage) {
      reduxDispatch(showMessage(errorMessage, 'error'));
    }
  }, [reduxDispatch, formErrors, errorMessage, showErrorMessage]);


  // fetch on component mount (if requested)
  React.useEffect(() => {
    if (fetchOnMount) fetchFunc();
  }, [fetchOnMount, fetchFunc]);


  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoading) {
      const {responseData, success} = await fetchFunc();
      if (success && onSubmitSuccess) {
        onSubmitSuccess(responseData);
      }
    }
  }

  return { 
    data,
    isLoading, 
    statusCode,     // not null only when `apiError` happens (non 200-299)
    errorMessage,
    formErrors,
    fetchFunc,
    handleSubmit, 
    setData: (newData) => localDispatch({type: 'setData', payload: newData}),
    resetSubmissionState: () => localDispatch({type: 'resetSubmissionState'})
  };

}

export default useApi;


export const useFetchedListOfItems = (asyncApiFunc) => {
/* Hook to asynchronously fetch list of items on component mount. */
  const [items, setItems] = React.useState([]);
  const { data } = useApi(asyncApiFunc, {fetchOnMount: true, withLoadingOverlay: true});
  
  React.useEffect(() => { 
    if (data) setItems(data); 
  }, [data, setItems]);

  return [items, setItems];
}


export const useSubmit = (asyncApiFunc, onSubmitSuccess, withLoadingOverlay=true) => {
  /* Hook for data submission. */
  const obj = useApi(asyncApiFunc, { onSubmitSuccess, withLoadingOverlay });
  return obj;
}