import React from 'react';

import { useSelector } from 'react-redux';
import { selectActiveGroupId, selectActiveTournamentId } from 'state';

import Chat from 'common/Chat';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import urlFor from 'urls';


const RoundChatPage = ({ roundId }) => {

  const groupId = useSelector(selectActiveGroupId);
  const tournamentId = useSelector(selectActiveTournamentId);

  useGroupPageTitle(groupId, "Chat");

  // page navbar items
  const getRoundItem = React.useCallback(() => ({
    text: `Round ${roundId}`,
    url: urlFor("ROUND", {groupId, tournamentId, roundId}), 
    isName: true
  }), [groupId, tournamentId, roundId]);
  useNavbarItem(getRoundItem);

  const getChatItem = React.useCallback(() => ({
    text: "Chat", 
    url: urlFor("DISCUSS_ROUND", { groupId, tournamentId, roundId }), 
    isName: false
  }), [groupId, tournamentId, roundId]);
  useNavbarItem(getChatItem);


  return (
    <div>
      <h2 className="heading heading--1">
        Round Discussion
      </h2>
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-8">
            <Chat groupId={ groupId } roundId={ roundId } />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoundChatPage;