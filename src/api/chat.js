import { client as apiClient } from './client';


export async function fetchCommunityChatMessages(communityId, page) {
  /*
    Fetch communities the user is a member of.
    A list of membership objects with nested community objects is expected.
  */
  let url = `/api/communities/${communityId}/chat/`;
  if (page) {
    url += "?page=" + page;
  }
  return await apiClient.get(url);
}

export async function fetchPostChatMessage(communityId, payload) {
  /*
    Send message to community chat.
    New chat message object is expected.
  */
  const { text } = payload;
  return await apiClient.post(`/api/communities/${communityId}/chat/`, { text });
}