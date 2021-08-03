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
    - on failure: rejected promise with an ApiError/FetchError object.
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
    // fake network latency during development
    if (process.env.NODE_ENV === "development") await timeout(1000);

    // response headers
    const response = await window.fetch(endpoint, config);

    // React proxy doesn't return json on proxy fails
    if ((process.env.NODE_ENV === "development") && (response.status === 500)) {
      throw new Error('Internal Server Error');
    }

    // response body
    let body;
    try { 
      body = await response.json() 
    } catch(e) {
      body = null;  // some endpoints return an empty body, e.g. logout
    }

    if (response.ok) {
      return body;
    } else {
      return Promise.reject(new ApiError(response, body));
    }
  } catch (err) {
    return Promise.reject(new FetchError(err));
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


function ApiError(response, body) {
  /*
    Returns an object representing an API response with a non-OK status code.
  */
  this.message = (body && body.detail) ? body.detail : response.statusText;
  this.status = response.status;
  this.formErrors = body ? body.form_errors : undefined;
}


function FetchError(e) {
  /* 
    Returns an object with `message` string of the error that 
    was thrown during the fetch process.
    Make error serializable so that it can be passed as action.payload.
  */
  this.message = e.message;
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