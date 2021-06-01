/* 
  Initialize normalized state. 

  Then, when you call the useReducer hook, like this:
    const [state, dispatch] = useReducer(reducer, initialArg, init)
  the initial state will be set to init(initialArg).
*/


function init({ numQuestions, numOptions }) {
    const questionsById = {};
    const optionsById = {};
    const allQuestionIds = [];
    const allOptionIds = [];
  
    for (let i=0; i<numQuestions; i++) {
      const questionId = `question-${i}`;
      
      // init question
      const question = {
        id: questionId,
        text: "",
        options: [],
      }
      questionsById[questionId] = question;
      allQuestionIds.push(questionId);
  
      // init question options
      for (let j=0; j<numOptions; j++ ) {
        const optionId = `question-${i}-option-${j}`;
        optionsById[optionId] = {
          id: optionId,
          text: "",
          isCorrect: false,
        }
        question.options.push(optionId);
        allOptionIds.push(optionId);
      }
    } 
  
    return {
      questions: {
        byId: questionsById,
        allIds: allQuestionIds,
      },
      options: {
        byId: optionsById,
        allIds: allOptionIds,
      }
    }
  }

  export default init;