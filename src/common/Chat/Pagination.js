import React from 'react';


const Pagination = ({ page, lastPage, handlePageChange }) => {
  const goPrev = () => {
    if (page - 1 > 0) {
      handlePageChange(page -1);
    }
  }

  const goNext = () => {
    if (page + 1 <= lastPage) {
      handlePageChange(page + 1);
    }
  }

  const goFirst = () => {
    if (page !== 1) {
      handlePageChange(1);
    }
  }

  const goLast = () => {
    if (page !== lastPage) {
      handlePageChange(lastPage);
    }
  }

  return (
    <div className="pagination">
      <div>
        <button className="pagination-button" onClick={ goFirst }>{ "<<" }</button>
        <button className="pagination-button" onClick={ goPrev }>prev</button>
      </div>
      <div>
       { `${ page } / ${ lastPage}` }
      </div>
      <div>
        <button className="pagination-button" onClick={ goNext }>next</button>
        <button className="pagination-button" onClick={ goLast }>{ ">>" }</button>
      </div>
    </div>
  )
}

export default Pagination;