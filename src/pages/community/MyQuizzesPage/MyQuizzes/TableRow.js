import React from 'react';

import MomentDateTime from 'common/MomentDateTime';

import 'styles/table.scss';
import 'styles/spacing.scss';
import 'styles/links.scss';


const MyQuizzesTableRow = ({ quiz, num, onEdit }) => {
  const {
    topic,
    is_submitted: isSubmitted,
    time_updated: timeUpdated,
  } = quiz;

  const [formatToggled, setFormatToggled] = React.useState(false);

  return (
    <tr className={`table__tr ${(num % 2) ? "table__tr--odd" : "table__tr--even"}`}>
      <td className = "table__td table__td--centered">
        { num }
      </td>
      <td className="table__td">
        <a className="link link--decorated" onClick={ onEdit }>
          { topic }
        </a>
      </td>
      <td className="table__td table__td--centered">
        { isSubmitted ? "yes" : "no" }
      </td>
      <td className="table__td table__td--centered" 
          onClick={ () => setFormatToggled(!formatToggled) }
      >
        <MomentDateTime 
          timestamp={ timeUpdated } 
          func="fromNow"
          refresh={ 60000 }
        />
        <div hidden={ formatToggled }>
          <MomentDateTime 
            timestamp={ timeUpdated } 
            func="format"
            format="MMM D, YYYY [at] h:mm a"
            refresh={ false }
          />
        </div>
      </td>
    </tr>
  )
}

export default MyQuizzesTableRow;