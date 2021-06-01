import React from 'react';

import MyQuizzesTableRow from './TableRow';

import 'styles/table.scss';
import 'styles/spacing.scss';


const MyQuizzesTable = ({ quizzes, onEditQuiz }) => (
  <table className="table table--full-width my-3">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="50%">Name</th>
        <th width="10%">Submitted</th>
        <th width="25%">Last Update</th>
      </tr>
    </thead>
    <tbody>
      { 
        quizzes.length 
        ? quizzes.map((quiz,i) => 
            <MyQuizzesTableRow 
              key={ quiz.id } 
              quiz={ quiz } 
              num={ i + 1 }
              onEdit={ () => onEditQuiz(quiz.id) }
            />
          ) 
        : <tr className={ "table__tr table__tr--odd" }>
            <td className="table__td" colSpan="5">
              Nothing here.
            </td>
          </tr>
      }
    </tbody>
  </table>
)

export default MyQuizzesTable;