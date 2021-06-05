import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveGroupId, selectActiveGroupId, selectMyGroupById } from 'state';


const ActiveGroup = ({ id, children }) => {
  /* 
    This component ensures that:
    - `activeGroup.id` corresponds to the URL;
    - `activeGroup.id` is available in the Redux store for child components;
    - user is a member of this active group.
  */
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveGroupId);
  const group = useSelector(state => selectMyGroupById(state, activeId));

  React.useEffect(() => {
      dispatch(setActiveGroupId(id));
  }, [id, dispatch]);

  if (id !== activeId) {
    return 'Something went wrong.';
  } else if (!group) {
    return 'You are not a member of this group.';
  } else {
    return children;
  }
}

export default ActiveGroup;