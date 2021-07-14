import React from 'react';

import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';


const ReviewForm = ({ data }) => {
  const {
    author: {
      username: authorName,
    },
    quiz: {
      name: quizName,
      questions,
      introduction,
    },
    play,
    play_answers: playAnswers,
    play_count: playCount,
    choices_by_question_id: choicesByQuestionId,
  } = data;

  const playAnswersByQuestionId = playAnswers.reduce(
    (obj, item) => ({...obj, [item.question_id]: item.option_id}), {}
  )

  return (
    <Form>
      <FormHeader text={`${quizName} by ${authorName}`} />
      <FormHelp text={ introduction } />
      <div className="form__item">
        <p>
          Taken by: <strong>{ playCount }</strong> players
        </p>
      </div>
      <div className="form__item">
        { 
          play.result
          ? <p>Correct answers: <strong>{ play.result }</strong></p>
          : <p>You didn't play this round.</p>
        }
      </div>

      {
        questions.map((q,i) => (
          <Question 
            key={q.id} 
            question={q} 
            num={i}
            selectedOptionId={playAnswersByQuestionId[q.id]}
            choices={choicesByQuestionId[q.id.toString()]}
            playCount={playCount}
          />
        ))
      }
    </Form>
  )
}


const Question = ({ num, question, selectedOptionId, choices }) => {
  const {
    text,
    options,
    explanation,
  } = question;

  const correctOption = options.find(obj => obj.is_correct);
  const isCorrect = selectedOptionId === correctOption.id;

  return (
    <div className={`form__item form__item--outlined`}>
      <div className={`form__label form__label--secondary bg-${isCorrect?"green":"red"}`}>
        Question { num + 1 }
      </div>
      <div className='form__label'>
        { text }
      </div>
      <table>
        <tbody>
          {
            options.map(option => (
              <OptionRow 
                key={option.id} 
                option={option} 
                isSelected={option.id === selectedOptionId} 
                selectedBy={choices[option.id.toString()]}
              />
            ))
          }
        </tbody>
      </table>
      <FormHelp text={ explanation } />
    </div>
  )
}


const OptionRow = ({ option, isSelected, selectedBy }) => {
  const {
    text,
    is_correct: isCorrect
  } = option;

  return (
    <tr className={`${isCorrect ? "text-green text-bold" : (isSelected ? "text-red text-bold" : "")}`}>
      <td className="px-4">
        { selectedBy }
      </td>
      <td className="px-4">
        {
          (isCorrect && isSelected) 
          ? "[✓]" 
          : (isSelected ? "[X]" : "")
        }
      </td>
      <td>
        { text }
      </td>
    </tr>
  )
}

export default ReviewForm;