import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveGroupId, selectActiveGroupId, selectMyGroupById } from 'state';


const ActiveGroup = ({ urlGroupId, children }) => {
  /* 
    This component ensures that:
    - `activeGroup.id` is available in the Redux store for child components;
    - `activeGroup.id` corresponds to the URL;
    - user is a member of this active group.
  */
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveGroupId);
  const group = useSelector(state => selectMyGroupById(state, activeId));

  React.useEffect(() => {
      dispatch(setActiveGroupId(urlGroupId));
  }, [dispatch, urlGroupId]);

  if (urlGroupId !== activeId) {
    // before the effect has run - render nothing
    return null;
  } else if (!group) {
    return 'You are not a member of this group.';
  } else {
    return children;
  }
}

export default ActiveGroup;