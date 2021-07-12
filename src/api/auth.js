import { client as apiClient } from './client';

const LS_USER_KEY = 'activeUser'; 


export const saveUser = (user) => {
  /* Save user to localStorage. */
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}

export const loadUser = () => {
  /* Load user from localStorage. Returns null if key does not exist. */
  return JSON.parse(localStorage.getItem(LS_USER_KEY)); 
}


export async function login(username, password) {
  /* 
    Send login credentials to backend.
    On success, a cookie and a user object are received.
    The cookie is handled by the browser.
  */
  return await apiClient.post("/api/login/", {username, password});
};


export async function logout() {
  /* 
    Log user out. 
    On success, the session cookie is invalidated (if present) by the browser. 
  */
  return await apiClient.post("/api/logout/", {});
}


export async function register(payload) {
  /* 
    Send registration credentials to backend.
    On success, a cookie and a user object are received.
    The cookie is handled by the browser.
  */
  const { username, password, email } = payload;
  return await apiClient.post("/api/register/", { username, password, email });
};


export async function resendConfirmEmail() {
  /*
    Request an email confirmation link one more time.
    On success, an empty response with 200 OK is received.
  */
  return await apiClient.post("/api/resend-confirm-email/", {});
};


export async function requestPasswordResetEmail(payload) {
  /*
    Request a password reset email.
    On success, an empty response with 200 OK is received.
  */
  const { email } = payload;
  return await apiClient.post(`/api/request-password-reset-email/`, { email });
}


export async function resetPassword(token_uuid, payload) {
  /*
    Send a new password to the password reset url previously received via email.
    On success, 200 OK is received.
  */
  const { password } = payload;
  return await apiClient.post(`/api/password-reset/${token_uuid}/`, { password });
};


export async function confirmEmail(token) {
  /*
    Send GET request with token received by email as part of url.
    On success, a user object is received. It is saved in localStorage.
  */
  return await apiClient.get(`/api/confirm-email/${token}/`);
}