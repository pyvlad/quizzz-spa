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
    await timeout(1000);  // TODO: remove this in production
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
      // throw apiError(response, body);
      return Promise.reject(apiError(response, body));
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
  return {
    message: (body && body.detail) ? body.detail : response.statusText,
    status: response.status,
    formErrors: body ? body.form_errors : undefined,
  }
}


export function clientError(e) {
  /* 
    Handle other request errors other than `apiError`.
    Make error serializable so that it can be passed as action.payload.
  */
  return {
    message: e.message,
  }
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


function timeout(ms) { 
  return new Promise(resolve => setTimeout(resolve, ms)); 
}