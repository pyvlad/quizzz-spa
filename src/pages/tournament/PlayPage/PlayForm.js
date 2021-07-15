import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectActiveTournamentId } from 'state';

import * as api from 'api';

import { useSubmit } from 'common/useApi';
import Form from 'common/Form';
import FormHeader from 'common/FormHeader';
import FormHelp from 'common/FormHelp';
import urlFor from 'urls';


const PlayForm = ({ groupId, roundId, quiz }) => {

  const tournamentId = useSelector(selectActiveTournamentId);

  const {
    name,
    introduction,
    questions,
  } = quiz;

  const history = useHistory();
  const [choices, setChoices] = React.useState({});

  const { isLoading, handleSubmit } = useSubmit(
    async () => {
      const payload = {
        "answers": Object.keys(choices).map(k => ({
          question_id: Number(k), 
          option_id: choices[k]}
        ))
      }
      return await api.submitRound(groupId, roundId, payload);
    },
    () => history.push(urlFor('REVIEW_ROUND', {groupId, tournamentId, roundId}))
  );

  return (
    <Form>
      <FormHeader text={name} />
      <FormHelp text={introduction} />
      {
        questions.map((q,i) => (
          <Question 
            key={q.id} 
            question={q} 
            num={i} 
            selectedOptionId={choices[q.id]}
            onSelectOption={optionId => setChoices({...choices, [q.id]: optionId})}
          />
        ))
      }
      <div className='form__item'>
        <button 
          className="btn btn--primary btn--block" 
          onClick={ handleSubmit }
          disabled={ isLoading }
        >
          Submit
        </button>
      </div>
    </Form>
  )
}

export default PlayForm;



const Question = ({ num, question, selectedOptionId, onSelectOption }) => {
  
  const { text, options } = question;

  return (
    <div className='form__item form__item--outlined'>
      <div className='form__label form__label--secondary'>
        Question { num + 1 }
      </div>
      <div className='form__label'>
        { text }
      </div>
      <fieldset className="form__fieldset">
        {
          options.map(option => (
            <div key={option.id} className="form__fieldset-item">
              <input 
                value={ option.id } 
                type="radio" 
                checked={ selectedOptionId === option.id }
                onChange={ () => onSelectOption(option.id) }
                id={ option.id }
              />
              <label className="form__fieldset-item-input" htmlFor={ option.id }>
                { option.text }
              </label>
            </div>
          ))
        }
      </fieldset>
    </div>
  )
}