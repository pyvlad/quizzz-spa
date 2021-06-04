export const selectQuestionById = (state, questionId) => (
  state.questions.byId[questionId]);

export const selectOptionById = (state, optionId) => (
  state.options.byId[optionId]);
  
export const selectOptionsByQuestionId = (state, questionId) => (
  state.questions.byId[questionId].options);

export const selectQuestionsToSubmit = (state) => {
  const questions = state.questions.allIds.map(id => ({...selectQuestionById(state, id)}));
  questions.forEach(question => {
    question.options = question.options.map(optionId=> {
      const {id, text, isCorrect} = selectOptionById(state, optionId);
      return {
        id,
        text,
        is_correct: isCorrect,
      }
    })
  })
  console.log(questions);
  return questions;
}