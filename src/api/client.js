/*
  A tiny wrapper around fetch(), based on:
  https://github.com/reduxjs/redux-essentials-example-app/blob/master/src/api/client.js
  Originally borrowed from:
  https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper
*/


export async function client(endpoint, { body, ...customConfig } = {}) {
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
    const data = await response.json();

    if (response.status === 401) {
      // redirect user to the login screen
      // window.location.assign('/login/')
      // return
    }

    if (response.ok) {
      return data;
    } else {
      // handle user errors
      const error = new Error(response.statusText);
      error.data = {
        message: response.statusText,
        status: response.status,
        userMessage: (data && data.userMessage) ? data.userMessage : '',
        body: (data && data.data) ? data.data : {}
      }
      throw error;
    }
  } catch (e) {
    return Promise.reject(e);
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