import { client as apiClient } from './client';


export async function getCommunityChatMessages(communityId, roundId, page) {
  /*
    Get paginated chat messages for a community.
    A list of chat message objects is expected.
  */
  let url = `/api/communities/${communityId}/chat/`;
  if (roundId || page) {
    const params = [];
    if (roundId) {
      params.push("round_id=" + roundId);
    }
    if (page) {
      params.push("page=" + page);
    }
    url += "?" + params.join("&");
  }
  return await apiClient.get(url);
}

export async function postChatMessage(communityId, roundId, payload) {
  /*
    Send message to community chat.
    New chat message object is expected.
  */
  const { text } = payload;
  let url = `/api/communities/${communityId}/chat/`;
  if (roundId) {
    url += "?round_id=" + roundId;
  }
  return await apiClient.post(url, { text });
}