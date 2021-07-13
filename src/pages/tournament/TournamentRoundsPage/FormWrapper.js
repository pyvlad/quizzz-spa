import React from 'react';


const FormWrapper = ({ children }) => (
  <div className="container">
    <div className="row">
      <div className="col-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
        <div className="paper-sm bg-grey p-2 p-md-4 my-2">
          { children }
        </div>
      </div>
    </div>
  </div>
)

export default FormWrapper;