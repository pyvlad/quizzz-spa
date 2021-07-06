import React from 'react';


const FormWrapper = ({ children }) => (
  <div className="container">
    <div className="row">
      <div className="col-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
        <div className="paper-sm bg-grey my-2">
          <div className="p-2 p-md-4">
            { children }
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default FormWrapper;