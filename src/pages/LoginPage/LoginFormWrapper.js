import React from 'react';


const LoginFormWrapper = ({ children }) => (
  <div className="container">
    <div className="row">
      <div className="col-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
        <div className="paper-sm bg-grey p-2 p-md-4 my-2">
          { children }
        </div>
      </div>
    </div>
  </div>
)

export default LoginFormWrapper;