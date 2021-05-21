/*
  A tiny wrapper around fetch(), based on:
  https://github.com/reduxjs/redux-essentials-example-app/blob/master/src/api/client.js
  Originally borrowed from:
  https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper
*/


export async function client(endpoint, { body, ...customConfig } = {}) {
  /*
    Returns:
    - on success: body of the response;
    - on failure: rejected promise with clientError object.
  */
  const csrfToken = getCookie("csrftoken");
  
  // set up headers
  const headers = {};
  headers['Content-Type'] = 'application/json';
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  if (customConfig.headers) {
    Object.assign(headers, customConfig.headers);
  }

  // set up config object
  const config = {
    ...customConfig,
    headers
  }
  if (body) {
    config.body = JSON.stringify(body);
  }

  // get response data / error message
  try {
    const response = await window.fetch(endpoint, config);

    // This shouldn't be needed but React proxy doesn't return json on proxy fails
    if (response.status === 500) {
      throw new Error('Internal Server Error');
    }

    let body;
    try {
      body = await response.json();
    } catch(e) {
      body = null;  // some endpoints return an empty body, e.g. logout
    }

    if (response.ok) {
      return body;
    } else {
      throw apiError(response, body);
    }
  } catch (err) {
    return Promise.reject(clientError(err));
  }
}

client.get = function (endpoint, customConfig = {}) {
  return client(endpoint, { ...customConfig, method: 'GET' });
}

client.post = function (endpoint, body, customConfig = {}) {
  return client(endpoint, { ...customConfig, body, method: 'POST' });
}

client.put = function (endpoint, body, customConfig = {}) {
  return client(endpoint, { ...customConfig, body, method: 'PUT' });
}

client.delete = function (endpoint, customConfig = {}) {
  return client(endpoint, { ...customConfig, method: 'DELETE' });
}


function apiError(response, body) {
  /*
    Handle api responses with non-OK status codes.
  */
  const error = new Error(response.statusText);

  error.data = {
    message: (body && body.error) ? body.error : response.statusText,
    status: response.status,
    body: (body && body.data) ? body.data : {},
  }

  return error;
}


export function clientError(e) {
  /* 
    Make error serializable so that it can be passed as action.payload.
    Successful requests with codes other than 200-299 return extra data
    attached to the error: { message, status, body }. Return 
    that object if it is present.
    Other errors don't have such an object attached to them. 
    Return { message } with e.message in that case.
  */
  return (e.data) ? e.data : { message: e.message };
}


function getCookie(name) {
  /* 
    Helper function to get cookie.
    Source: https://javascript.info/cookie
  */
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}