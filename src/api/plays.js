import { client as apiClient } from './client';


export async function startRound(communityId, roundId) {
  /*
    Start the clock (if not started yet) and fetch the quiz to play.
    A Quiz object (see `PlayQuizSerializer`) with nested questions and options is expected.
  */
  return await apiClient.post(`/api/communities/${communityId}/play/${roundId}/start/`);
}

export async function submitRound(communityId, roundId, payload) {
  /*
    Stop the clock, submit the answers, and fetch results.
    A Play object (`SubmittedPlaySerializer`) with nested answers is expected.
  */
  const {
    clientStartTime: client_start_time, 
    clientFinishTime: client_finish_time,
    answers,
  } = payload;
  return await apiClient.post(
    `/api/communities/${communityId}/play/${roundId}/submit/`, 
    { client_start_time, client_finish_time, answers }
  );
}

export async function reviewRound(communityId, roundId) {
  /*
    Fetch play results with nested 'quiz', 'answers', and 'author' objects.
  */
  return await apiClient.get(`/api/communities/${communityId}/play/${roundId}/review/`);
}