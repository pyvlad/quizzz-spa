import React from 'react';
import { useSelector } from 'react-redux';

import { selectMyCommunityById } from 'features/myCommunities/slice';
import ChatBox from 'features/chat/ChatBox';


const CommunityPage = ({ communityId }) => {
  const community = useSelector(state => selectMyCommunityById(state, communityId));

  return (
    <div>
      This is { community.name }.
      <ChatBox communityId={ communityId } />
    </div>
  )
}

export default CommunityPage;