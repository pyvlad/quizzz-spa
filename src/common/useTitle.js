import React from 'react';

import { useSelector } from 'react-redux';
import { selectMyGroupById } from 'state';


const useTitle = title => {
  React.useEffect(() => {
    document.title = `${title} | Quizzz`; 
  }, [title]);
}

export default useTitle;


export const useGroupPageTitle = (groupId, title) => {
  const group = useSelector(state => selectMyGroupById(state, groupId));
  const modifiedTitle = group 
    ? `${title} - ${group.name}`
    : "Not a member";

  React.useEffect(() => {
    document.title = `${modifiedTitle} | Quizzz`; 
  }, [groupId, modifiedTitle]);
}