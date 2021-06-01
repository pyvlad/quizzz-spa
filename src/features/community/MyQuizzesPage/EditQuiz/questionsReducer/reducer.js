const questionsReducer = (state, action) => {
  switch (action.type) {

    case 'SET_QUESTION_TEXT': {
      const { questionId, text } = action.payload;
      const newState = {
        ...state,
        questions: {
          ...state.questions,
          byId: {
            ...state.questions.byId,
            [questionId]: {
              ...state.questions.byId[questionId],
              text,
            }
          }
        }
      }
      return newState;
    }
    
    case 'SET_OPTION_TEXT': {
      const { optionId, text } = action.payload;
      return {
        ...state, 
        options: {
          ...state.options,
          byId: {
            ...state.options.byId,
            [optionId]: {
              ...state.options.byId[optionId],
              text,
            }
          }
        }
      }
    }

    case 'SET_CORRECT_OPTION': {
      const { optionId, questionId } = action.payload;

      const question = state.questions.byId[questionId];
      const optionIds = question.options;
      
      const newState = {
        ...state, 
        options: {
          ...state.options,
          byId: {
            ...state.options.byId,
          }
        }
      }
      // set other question options' "isCorrect" value to false
      for (let id of optionIds) {
        newState.options.byId[id] = {
          ...state.options.byId[id],
          isCorrect: false,
        };
      }
      // set selected options "isCorrect" value to true
      newState.options.byId[optionId] = {
        ...state.options.byId[optionId],
        isCorrect: true,
      };

      return newState;
    }

    default:
      throw new Error(`unknown action type: ${action.type}`)
  }
}

export default questionsReducer;