import React from 'react';

import 'styles/form.scss';
import 'styles/btn.scss';


const SaveDraftButton = () => {
  return (
    <div className='form__item bg-grey'>
      <input 
        className="btn btn--secondary btn--mw150" 
        type="submit" 
        name="draft" 
        value="Save Draft"
      />
      <div className='form__help'>
        Save the quiz and review/update it later if you are not finished yet.
      </div>
    </div>
  )
}

export default SaveDraftButton;