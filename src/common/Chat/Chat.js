import React from 'react';

import Message from './Message';
import Pagination from './Pagination';
import NewMessageForm from './NewMessageForm';

import * as api from 'api';

import { useFetchedListOfItems } from 'common/useApi';
import useListUpdateDeleteViews from 'common/useListUpdateDeleteViews';


const PAGE_SIZE = (process.env.NODE_ENV === "development") ? 2 : 10;


const Chat = ({ groupId, roundId }) => {
  
  // pagination
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);

  // fetch array of messages on mount
  const fetchFunc = React.useCallback(
    async () => {
      const data = await api.getCommunityChatMessages(groupId, roundId, page);
      setLastPage(Math.max(1, Math.ceil(data["count"] / PAGE_SIZE)));
      return data["results"];
    }, [groupId, roundId, page, setLastPage]
  )
  const [messages, setMessages, isLoading] = useFetchedListOfItems(fetchFunc);

  // page views and handlers
  const {
    editedItemId: editedMessageId,
    setEditedItemId: setEditedMessageId,
    handleItemUpdated: handleMessageUpdated,
  } = useListUpdateDeleteViews(messages, setMessages);

  // return
  return (editedMessageId === null)
    // a. show current page messages
    ? <div>
        <button className="btn btn--primary" onClick={ () => setEditedMessageId(0) }>
          New Message
        </button>
        <div className="my-4">
          {
            isLoading
            ? "Loading..."
            : messages.length
              ? messages.map(m => <Message key={ m.id } msg={ m } />)
              : <p className="heading--3 my-4">
                  No messages here yet. Be the first to say something!
                </p>
          }
        </div>
        <Pagination 
          page={ page } 
          lastPage={ lastPage }
          handlePageChange={ page => setPage(page) }
        />
      </div>
    // b. show new message form
    : <div>
        <button 
          onClick={() => setEditedMessageId(null)} 
          className="btn btn--grey btn--mw150"
        >
          ⏎ back
        </button>
        <NewMessageForm 
          groupId={ groupId } 
          roundId={ roundId }
          onMessagePosted={ handleMessageUpdated } 
        />
      </div>
}

export default Chat;