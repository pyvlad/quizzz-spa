import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveCommunityId } from 'state/communitySlice';

import Chat from 'common/Chat';
import 'styles/grid.scss';
import 'styles/headings.scss';


const ChatPage = () => {
  const communityId = useSelector(selectActiveCommunityId);

  return (
    <div>
      <h2 className="heading heading--1">
        Group Chat
      </h2>
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-8 col-lg-offset-2">
            <Chat communityId={ communityId } />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage;