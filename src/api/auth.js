import { client as apiClient } from './client';

const LS_USER_KEY = 'activeUser'; 


const saveUser = (user) => {
  /* Save user to localStorage. */
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}

const removeUser = () => {
  /* Remove user item from localStorage. */
  localStorage.removeItem(LS_USER_KEY);
}

export const loadUser = () => {
  /* Load user from localStorage. Returns null if key does not exist. */
  return JSON.parse(localStorage.getItem(LS_USER_KEY)); 
}


export async function login(username, password) {
  /* 
    Send login credentials to backend.
    On success, a cookie and a user object are received.
    The cookie is handled by the browser, the user object is saved in localStorage.
  */
  const data = await apiClient.post("/api/login/", {username, password});
  saveUser(data);
  return data;
};


export async function logout() {
  /* 
    Log user out. 
    On success, the session cookie is invalidated (if present) by the browser. 
    The user object is removed from localStorage.
  */
  const data = await apiClient.post("/api/logout/", {});
  removeUser();
  return data;
}