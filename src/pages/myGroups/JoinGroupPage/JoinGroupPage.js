import React from 'react';

import JoinGroupForm from './JoinGroupForm';
import useTitle from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import urlFor from 'urls';


const JoinGroupPage = () => {

  useTitle("Join Group");
  const getItem = React.useCallback(() => ({
    text: "Join", 
    url: urlFor("JOIN_GROUP"),
    isName: false
  }), []);
  useNavbarItem(getItem);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
          <div className="paper-sm bg-grey p-2 p-md-4 my-2">
            <JoinGroupForm />
          </div>
        </div>
      </div>
    </div>
  )
}


export default JoinGroupPage;