import React from 'react';

import Message from './Message';
import Pagination from './Pagination';

import 'styles/grid.scss';
import 'styles/headings.scss';
import 'styles/btn.scss';
import 'styles/spacing.scss';

import { fetchCommunityChatMessages } from 'api';

const PAGE_SIZE = 2;


const ViewChat = ({ communityId }) => {
  const [page, setPage] = React.useState(1);
  const [messages, setMessages] = React.useState([]);
  const [lastPage, setLastPage] = React.useState({});

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCommunityChatMessages(communityId, page);
        const lastPage = Math.max(1, Math.ceil(data["count"] / PAGE_SIZE));
        setLastPage(lastPage);
        setMessages(data["results"]);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [communityId, page, setMessages, setLastPage])

  return (
    <React.Fragment>
      <div>
        {
          messages.length
          ? messages.map(m => <Message key={ m.id } msg={ m } />)
          : <p className="heading--3 my-4">
              No messages here yet. Be the first to say something!
            </p>
        }
      </div>
      <Pagination 
        page={ page } 
        lastPage={ lastPage }
        handlePageChange={ (page) => setPage(page) }
      />
    </React.Fragment>
  )
}

export default ViewChat;