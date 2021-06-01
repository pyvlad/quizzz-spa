import React from 'react';

import MyQuizzesTable from './Table';
import FilterTabs from './FilterTabs';


const quizzes = [];


const MyQuizzes = ({ communityId }) => {

  // define filters
  const filters = ["submitted", "unfinished", "all"];
  const [activeFilter, setActiveFilter] = React.useState("all");

  // apply current filter
  let rows = [...quizzes];
  if (activeFilter === "submitted") {
    rows = rows.filter(r => r.is_submitted)
  } else if (activeFilter === "unfinished") {
    rows = rows.filter(r => !r.is_submitted);
  }

  // sort selected rows
  rows.sort((a,b) => {
    // show non-submitted first
    if (a.is_submitted && !b.is_submitted) return 1;
    if (!a.is_submitted && b.is_submitted) return -1;
    // within 'submitted' and 'non-submitted' categories sort by last update
    if (a.last_update > b.last_update) return -1;
  });
  
  return (
    <React.Fragment>
      <FilterTabs 
        filters={ filters } 
        activeFilter={ activeFilter } 
        onSelectFilter={ setActiveFilter } 
      />
      <MyQuizzesTable 
        quizzes={ rows } 
        onEditQuiz={ null } 
      />
    </React.Fragment>
  )
}

export default MyQuizzes;