import { client as apiClient } from './client';


export async function getCommunityChatMessages(communityId, page) {
  /*
    Get paginated chat messages for a community.
    A list of chat message objects is expected.
  */
  let url = `/api/communities/${communityId}/chat/`;
  if (page) {
    url += "?page=" + page;
  }
  return await apiClient.get(url);
}

export async function postChatMessage(communityId, payload) {
  /*
    Send message to community chat.
    New chat message object is expected.
  */
  const { text } = payload;
  return await apiClient.post(`/api/communities/${communityId}/chat/`, { text });
}