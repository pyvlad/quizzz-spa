import React from 'react';
import Chat from './Chat';
import NewMessageForm from './NewMessageForm';


const Chatbox = ({ communityId }) => {
  const [view, setView] = React.useState('chat'); // "chat"|"new"

  const showChat = () => setView('chat');
  const showNewMessageForm = () => setView('new');

  function showContent(view) {
    switch (view) {
      case 'chat':
        return (
          <Chat communityId={ communityId } 
                showNewMessageForm={ showNewMessageForm } />
        )
      case 'new':
        return (
          <NewMessageForm communityId={ communityId } 
                          showChat={ showChat } />
        )
      default:
        return null;
    }
  }

  return (
    <div>
      <h2 className="heading heading--1">
        Group Chat
      </h2>
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-8 col-lg-offset-2">
            { showContent(view) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbox;