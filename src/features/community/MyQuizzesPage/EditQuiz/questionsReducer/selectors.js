export const selectQuestionById = (state, questionId) => (
  state.questions.byId[questionId]);

export const selectOptionById = (state, optionId) => (
  state.options.byId[optionId]);
  
export const selectOptionsByQuestionId = (state, questionId) => (
  state.questions.byId[questionId].options);