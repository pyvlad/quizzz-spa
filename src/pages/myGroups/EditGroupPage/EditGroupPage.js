import React from 'react';

import EditGroupForm from './EditGroupForm';
import useTitle from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import urlFor from 'urls';


const EditGroupPage = ({ groupId }) => {

  useTitle(groupId ? "Edit Group" : "Create Group");
  const getItem = React.useCallback(() => ({
    text: groupId ? "Edit" : "Create", 
    url: groupId ? urlFor("EDIT_GROUP", {groupId}) : urlFor("CREATE_GROUP"), 
    isName: false
  }), [groupId]);
  useNavbarItem(getItem);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
          <div className="paper-sm bg-grey p-2 p-md-4 my-2">
            <EditGroupForm groupId={groupId} />
          </div>
        </div>
      </div>
    </div>
  )
}


export default EditGroupPage;