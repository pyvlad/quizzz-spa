import React from 'react';
import { useSelector } from 'react-redux';

import { selectMyCommunityById } from './slice';


const SingleCommunity = ({ communityId }) => {
  const community = useSelector(state => selectMyCommunityById(state, communityId));

  return (
    <div>
      This is {community.name}.
    </div>
  )
}

export default SingleCommunity;