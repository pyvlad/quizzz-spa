// key to save user in local storage
const LS_USER_KEY = 'activeUser';


export const saveUser = (user) => {
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}


export const loadUser = () => {
  return JSON.parse(localStorage.getItem(LS_USER_KEY)); // returns null if does not exist
}


export async function login(username, password) {
  /* 
    Send login credentials to backend.
    On success, returns 200 and sets a cookie.
  */
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch("/api/login/", {
    method: "POST", 
    body: formData
  });
  const data = await response.json();

  if (response.status === 200) saveUser(data);

  return {status: response.status, data};
};


export async function logout() {
  /* 
    Log user out. 
    Invalidates session cookie if present.
  */
  const csrfToken = getCookie("csrftoken");

  const response = await fetch("/api/logout/", { 
    method: "POST", 
    headers: {
      'X-CSRFToken': csrfToken
    }
  });
  const data = await response.json();

  if (response.status === 200) saveUser(null);

  return {status: response.status, data};
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