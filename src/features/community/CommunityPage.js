import React from 'react';
import { useSelector } from 'react-redux';

import { selectMyCommunityById } from 'features/myCommunities/slice';
import ChatBox from 'features/chat/ChatBox';
import { Link } from 'react-router-dom';
import urlFor from 'urls';


const CommunityPage = ({ communityId }) => {
  const community = useSelector(state => selectMyCommunityById(state, communityId));

  return (
    <div>
      <div>
        This is { community.name }.
      </div>
      <div>
        <Link to={ urlFor("COMMUNITY_MEMBERS", {communityId: communityId })}>
          Group Members
        </Link>
      </div>
      <div>
        <Link to={ urlFor("COMMUNITY_MY_QUIZZES", {communityId: communityId })}>
          My Quizzes
        </Link>
      </div>
      <ChatBox communityId={ communityId } />
    </div>
  )
}

export default CommunityPage;