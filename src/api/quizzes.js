import { client as apiClient } from './client';


export async function fetchMyQuizzes(communityId) {
  /*
    Fetch quizzes the user has created.
    A list of Quiz objects is expected.
  */
  return await apiClient.get(`/api/communities/${communityId}/quizzes/`);
}


export async function fetchCreateQuiz(communityId, payload) {
  /*
    Send request to create a new quiz.
    New quiz object is expected (questions are initialized in database).
  */
  const { name, description } = payload;
  return await apiClient.post(`/api/communities/${communityId}/quizzes/`, { name, description });
}


export async function fetchQuiz(communityId, quizId) {
  /*
    Fetch quiz with nested questions and question options.
  */
  return await apiClient.get(`/api/communities/${communityId}/quizzes/${quizId}/`);
}


export async function fetchUpdateQuiz(communityId, quizId, payload) {
  /*
    Send quiz with nested questions and question options to updated it on the backend. 
    Updated quiz object with nested questions and question options is expected.
  */
  return await apiClient.put(`/api/communities/${communityId}/quizzes/${quizId}/`, payload);
}


export async function fetchDeleteQuiz(communityId, quizId) {
  /*
    Send request to delete a quiz.
  */
  return await apiClient.delete(`/api/communities/${communityId}/quizzes/${quizId}/`);
}