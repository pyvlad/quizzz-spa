import { client as apiClient } from './client';


export async function fetchUserMemberships(userId) {
  /*
    Fetch communities the user is a member of.
    A list of membership objects with nested community objects is expected.
  */
  return await apiClient.get(`/api/communities/user-memberships/${userId}/`);
}

export async function fetchJoinCommunity(payload) {
  /* 
    Send group credentials.
    New membership object with nested community object is expected.
  */
  const { name, password } = payload;
  return await apiClient.post("/api/communities/join/", { name, password });
}

export async function fetchCreateCommunity(payload) {
  /*
    Send desired parameters of the new community.
    New membership object with nested community object is expected
  */
  const { name, password, approval_required } = payload;
  return await apiClient.post(
    "/api/communities/create/", 
    { name, password, approval_required }
  )
}

export async function fetchEditCommunity(communityId, payload) {
  /*
    Send updated parameters of an existing community.
    Updated community object is expected.
  */
  const { name, password, approval_required } = payload;
  return await apiClient.put(
    `/api/communities/${communityId}/`, 
    { name, password, approval_required }
  )
}

export async function fetchDeleteMembership(communityId, userId) {
  /*  
    Send request to delete an existing membership.
    204 code with None as data is expected.
  */
  return await apiClient.delete(`/api/communities/${communityId}/members/${userId}/`);
}

export async function fetchDeleteCommunity(communityId) {
  /*
    Send request to delete an existing community.
    204 code with None as data is expected. 
    Returns communityId.
  */
  return await apiClient.delete(`/api/communities/${communityId}/`);
}
