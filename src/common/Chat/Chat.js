import React from 'react';
import ViewChat from './ViewChat';
import NewMessageForm from './NewMessageForm';


const Chat = ({ communityId }) => {
  const [view, setView] = React.useState('chat'); // "chat"|"new"

  const showChat = () => setView('chat');
  const showNewMessageForm = () => setView('new');

  return (view === 'chat') 
    ? <div>
        <button className="btn btn--secondary" onClick={ showNewMessageForm }>
          New Message
        </button>
        <ViewChat communityId={ communityId } />
      </div>
    : <div>
        <button className="btn btn--secondary" onClick={ showChat }>
          Back to Chat
        </button>
        <NewMessageForm communityId={ communityId } onSubmit={ showChat } />
      </div>
}

export default Chat;