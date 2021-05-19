import { client as apiClient } from './client';


export async function fetchUserCommunities(userId) {
  /*
    Fetch communities the user is a member of.
    On success, a list of membership objects with nested community data is received. 
  */
  return await apiClient.get(`/api/users/${userId}/communities/`);
};


export async function fetchJoinCommunity({ name, password }) {
  /* 
    Send group credentials to backend.
    On success, a group object is received.
  */
  return await apiClient.post("/api/join-community/", {name, password});
}


export async function fetchLeaveCommunity({ communityId, userId }) {
  /* 
    Send request to leave the group.
    On success, None is received with 204 code.
  */
  return await apiClient.delete(`/api/communities/${communityId}/members/${userId}/`);
}