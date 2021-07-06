import React from 'react';

import './index.scss';


export const LoadingContainer = ({ children }) => (
  <div className="loading__container">
    { children }
  </div>
)

export const LoadingOverlay = ({ contained=false }) => (
  <div className={`loading__overlay ${contained ? 'loading__overlay--contained' : ''}`}>
    <div className="loading__spinner">
    </div>
  </div>
)

const Loading = ({ isLoading, children }) => {
  return (
    <LoadingContainer>
      { isLoading ? <LoadingOverlay contained /> : null }
      { children }
    </LoadingContainer>
  )
}

export default Loading;