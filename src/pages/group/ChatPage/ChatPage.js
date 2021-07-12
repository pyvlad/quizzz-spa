import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import Chat from 'common/Chat';
import { useGroupPageTitle } from 'common/useTitle';


const ChatPage = () => {

  const groupId = useSelector(selectActiveGroupId);
  useGroupPageTitle(groupId, "Chat");

  return (
    <div>
      <h2 className="heading heading--1">
        Group Chat
      </h2>
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-8 col-lg-offset-2">
            <Chat groupId={ groupId } />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage;