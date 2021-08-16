import { shuffleArray } from 'utils';


export async function fetchQuestionsFromOpenTriviaDB(originalQuiz) {

  const numQuestions = originalQuiz.questions.length;
  const url = `https://opentdb.com/api.php?amount=${numQuestions}&type=multiple&encode=base64`;

  const response = await fetch(url);
  const OTDBData = await response.json();
  const OTDBQuestions = OTDBData["results"];

  const quiz = OTDBQuestionsToQuiz(originalQuiz.questions, OTDBQuestions);
  return quiz;
  
}


// OTDB stands for 'OpenTriviaDB'
function OTDBQuestionsToQuiz(originalQuizQuestions, OTDBQuestions) {

  // quiz meta data
  const quiz = {
    description: "This quiz was generated with randomly selected questions from the Open Trivia DB",
    introduction: "",
    is_finalized: false,
    name: "Auto Generated",
    questions: [],
  };

  // transform original quiz questions into expected format
  originalQuizQuestions.forEach((oldQuestion,i) => {

    const OTDBQuestion = OTDBQuestions[i];
    const OTDBQuestionOptions = shuffleArray([
      OTDBQuestion["correct_answer"], 
      ...OTDBQuestion["incorrect_answers"]
    ]);


    const newQuestion = {
      explanation: "",
      id: oldQuestion.id,
      text: atob(OTDBQuestion["question"]),
      options: [],
    }
    
    // transform options into expected format
    oldQuestion.options.forEach((opt,j) => {
      newQuestion.options.push({
        id: opt.id,
        text: atob(OTDBQuestionOptions[j]),
        is_correct: OTDBQuestionOptions[j] === OTDBQuestion["correct_answer"],
      })
    })

    quiz.questions.push(newQuestion);
  })

  return quiz;
}