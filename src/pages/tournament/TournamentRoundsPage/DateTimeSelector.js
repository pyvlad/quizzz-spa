import React from 'react';
import moment from 'moment';
import MomentDateTime from 'common/MomentDateTime';


const DateTimeSelector = ({date, setDate}) => {

  const setTimeToMidnight = () => {
    const newDate = new Date(date.getTime());
    newDate.setHours(0);
    newDate.setMinutes(0);
    setDate(newDate);
  }

  const onDateChange = (e) => {
    const newDate = new Date(e.target.value);
    newDate.setHours(date.getHours());
    newDate.setMinutes(date.getMinutes())
    setDate(newDate);
  }

  const onHoursChange = (e) => {
    const newDate = new Date(date.getTime());
    newDate.setHours(e.target.value);
    setDate(newDate);
  }

  const onMinutesChange = (e) => {
    const newDate = new Date(date.getTime());
    newDate.setMinutes(e.target.value);
    setDate(newDate);
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-6">
          <div className="form__input-help">
            date
          </div>
          <input 
            className="form__input" 
            type="date"
            value={ moment(date).format('YYYY-MM-DD') }
            onChange={ onDateChange }
          />
        </div>
        <div className="col-offset-1 col-2">
          <div className="form__input-help">
            hours
          </div>
          <input 
            className="form__input" 
            type="number" 
            min="0" 
            max="23" 
            required
            value={ date.getHours() }
            onChange={ onHoursChange }
          />
        </div>
        <div className="col-offset-1 col-2">
          <div className="form__input-help">
            minutes
          </div>
          <input 
            className="form__input" 
            type="number" 
            min="0" 
            max="59" 
            required
            value={ date.getMinutes() }
            onChange={ onMinutesChange }
          />
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          <div className="text-small">
            (<MomentDateTime timestamp={date.toISOString()} refresh={100} />)
          </div>
        </div>
        <div className="col-offset-1 col-5">
          <div 
            className="link link--grey text-small text-centered"
            onClick={ setTimeToMidnight }>
            set to midnight
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateTimeSelector;