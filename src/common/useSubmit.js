import React from 'react';


const useSubmit = (asyncSubmitFunction, onSuccess) => {
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
    - `errors` object with the body of the fetch response or 
      {non_field_errors: [err.message]} if the error doesn't have the 'body' property
      (see 'client.js' in 'api' for details of error handling)
  */
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;
      let result = null;
      
      try {
        result = await asyncSubmitFunction();
        success = true;
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);

      if (success && onSuccess) {
        onSuccess(result);
      }
    }
  }

  return { isLoading, errors, handleSubmit };
}

export default useSubmit;