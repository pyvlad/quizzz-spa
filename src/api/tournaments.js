import { client as apiClient } from './client';


export async function getCommunityTournaments(communityId) {
  /*
    Fetch group tournaments.
    A list of Tournament objects is expected.
  */
  return await apiClient.get(`/api/communities/${communityId}/tournaments/`);
}

export async function createTournament(communityId, payload) {
  /*
    Send request to create a new tournament.
    New tournament object is expected.
  */
  const { name, is_active } = payload;
  return await apiClient.post(`/api/communities/${communityId}/tournaments/`, { name, is_active });
}

export async function updateTournament(communityId, tournamentId, payload) {
  /*
    Send request to update an existing tournament.
    Updated tournament object is expected.
  */
  const { name, is_active } = payload;
  return await apiClient.put(
    `/api/communities/${communityId}/tournaments/${tournamentId}/`, 
    { name, is_active }
  );
}

export async function deleteTournament(communityId, tournamentId) {
  /*
    Delete tournament by id.
  */
  return await apiClient.delete(`/api/communities/${communityId}/tournaments/${tournamentId}/`);
}



export async function getTournamentRounds(communityId, tournamentId) {
  /*
    Fetch tournament rounds.
    A list of Round objects is expected.
  */
  return await apiClient.get(
    `/api/communities/${communityId}/tournaments/${tournamentId}/rounds/`
  );
}

export async function createRound(communityId, tournamentId, payload) {
  /*
    Send request to create a new round.
    New round object is expected.
  */
  return await apiClient.post(
    `/api/communities/${communityId}/tournaments/${tournamentId}/rounds/`, 
    payload
  );
}

export async function updateRound(communityId, roundId, payload) {
  /*
    Send request to update an existing round.
    Updated round object is expected.
  */
  return await apiClient.put(
    `/api/communities/${communityId}/tournaments/rounds/${roundId}/`, 
    payload
  );
}

export async function deleteRound(communityId, roundId) {
  /*
    Delete round by id.
  */
  return await apiClient.delete(
    `/api/communities/${communityId}/tournaments/rounds/${roundId}/`
  );
}


export async function getQuizPool(communityId) {
  /*
    Fetch quizzes available for selection.
    A list of Quiz objects is expected.
  */
  return await apiClient.get(`/api/communities/${communityId}/tournaments/quiz-pool/`);
}