import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';

import useSubmit from 'common/useSubmit';
import FormFieldErrors from 'common/FormFieldErrors';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';

import DateTimeSelector from './DateTimeSelector';
import QuizSelector from './QuizSelector';


const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}


const EditRoundForm = ({ round={}, onRoundUpdate, tournamentId }) => {

  const groupId = useSelector(selectActiveGroupId);

  // INITIAL FORM DATA
  const { id, start_time, finish_time, quiz } = round;

  // FORM STATE
  const [startTime, setStartTime] = useState(start_time ? new Date(start_time) : new Date());
  const [finishTime, setFinishTime] = useState(finish_time ? new Date(finish_time) : getTomorrow());
  const [quizId, setQuizId] = useState(quiz ? quiz.id : '');
  
  // FORM SUBMISSION
  const { isLoading, formErrors, handleSubmit } = useSubmit(
    async () => {
      const payload = { start_time: startTime, finish_time: finishTime, quiz: quizId };
      return id 
        ? await api.updateRound(groupId, id, payload)
        : await api.createRound(groupId, tournamentId, payload);
    },
    roundObj => {
      onRoundUpdate(roundObj);
    }
  )

  // FORM ERRORS
  const {
    non_field_errors: nonFieldErrors,
    start_time: startTimeErrors,
    finish_time: finishTimeErrors,
    quiz: quizErrors,
  } = formErrors || {};


  // RENDERING
  return (
    <Form>
      <FormFieldErrors errors={ nonFieldErrors } />
      <FormHeader text={ id ? "Edit Round" : "New Round" } />
      <FormHelp text="Please fill in the form below and hit 'save'"/>
      <div className="form__item">
        <div className="form__label">
          Quiz
        </div>
        <QuizSelector 
          selectedQuizId={quizId} 
          onSelectQuiz={quizId => setQuizId(quizId)}
          groupId={groupId}
          editedQuiz={quiz}
        />
        <FormFieldErrors errors={ quizErrors } />
      </div>
      <div className="form__item">
        <div className="form__label">
          Start Time
        </div>
        <FormHelp text="Select the time (your local time) when quiz will become available for play."/>
        <DateTimeSelector 
          date={ startTime } 
          setDate={ setStartTime }
        />
        <FormFieldErrors errors={ startTimeErrors } />
      </div>
      <div className="form__item">
        <div className="form__label">
          Finish Time
        </div>
        <FormHelp text="Select the time (your local time) when quiz will stop being available for play."/>
        <DateTimeSelector 
          date={ finishTime } 
          setDate={ setFinishTime }
        />
        <FormFieldErrors errors={ finishTimeErrors } />
      </div>
      <div className='form__item'>
        <button 
          className="btn btn--secondary btn--block" 
          onClick={ handleSubmit }
          disabled={ isLoading }
        >
          Submit
        </button>
      </div>
    </Form>
  )
}

export default EditRoundForm;