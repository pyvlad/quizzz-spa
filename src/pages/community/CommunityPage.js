import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectMyCommunityById } from 'state/myCommunitiesSlice';
import urlFor from 'urls';


const CommunityPage = ({ communityId }) => {
  const { name } = useSelector(state => selectMyCommunityById(state, communityId));

  return (
    <div>
      <div>
        This is { name }.
      </div>
      <div>
        <Link to={ urlFor("COMMUNITY_MEMBERS", { communityId })}>
          Group Members
        </Link>
      </div>
      <div>
        <Link to={ urlFor("COMMUNITY_MY_QUIZZES", { communityId })}>
          My Quizzes
        </Link>
      </div>
      <div>
        <Link to={ urlFor("COMMUNITY_CHAT", { communityId })}>
          Chat
        </Link>
      </div>
    </div>
  )
}

export default CommunityPage;