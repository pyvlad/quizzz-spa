import React from 'react';


const SaveDraftButton = ({ onClick, disabled=false }) => {
  return (
    <div className='form__item bg-grey'>
      <div style={{ display: "flex", alignItems: "center"}}>
        <div>
          <input 
            className="btn btn--secondary btn--mw150" 
            type="submit" 
            name="draft" 
            value="Save Draft"
            onClick={ onClick }
            disabled={ disabled }
          />
        </div>
        <div className='form__help p-2'>
          Save as draft and finish later.
        </div>
      </div>
    </div>
  )
}

export default SaveDraftButton;