export const setQuestionText = (questionId, text) => ({
  type: "SET_QUESTION_TEXT",
  payload: {
    questionId,
    text,
  }
});

export const setOptionText = (optionId, text) => ({
  type: "SET_OPTION_TEXT",
  payload: {
    optionId, 
    text,
  }
});

export const setCorrectOption = (optionId, questionId) => ({
  type: "SET_CORRECT_OPTION",
  payload: {
    optionId,
    questionId,
  }
});