import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import MyQuizzesTable from './Table';
import FilterTabs from './FilterTabs';
import * as api from 'api';


const MyQuizzes = ({ onEditQuiz }) => {

  const groupId = useSelector(selectActiveGroupId)
  const [quizzes, setQuizzes] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getMyQuizzes(groupId);
        setQuizzes(data);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [groupId, setQuizzes])


  // define filters
  const filters = ["submitted", "unfinished", "all"];
  const [activeFilter, setActiveFilter] = React.useState("all");

  // apply current filter
  let rows = [...quizzes];
  if (activeFilter === "submitted") {
    rows = rows.filter(r => r.is_finalized)
  } else if (activeFilter === "unfinished") {
    rows = rows.filter(r => !r.is_finalized);
  }

  // sort selected rows
  rows.sort((a,b) => {
    // show non-submitted first
    if (a.is_finalized && !b.is_finalized) return 1;
    if (!a.is_finalized && b.is_finalized) return -1;
    // within 'submitted' and 'non-submitted' categories
    // more recent items should be at the start of array
    // (if b is 'newer' - then switch):
    if (a.time_updated < b.time_updated) return 1;
    // default: leave elements in the same order
    return -1;
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
        onEditQuiz={ onEditQuiz } 
      />
    </React.Fragment>
  )
}

export default MyQuizzes;