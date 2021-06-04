import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveCommunityId } from 'state/communitySlice';

import { fetchMembershipList } from 'api';
import { selectMyMembershipByCommunityId } from 'state/myCommunitiesSlice';

import MembersTable from './Table';
import EditMember from './EditMember';

import 'styles/headings.scss';
import 'styles/btn.scss';


const MembersPage = () => {
  const communityId = useSelector(selectActiveCommunityId);
  const membership = useSelector(state => selectMyMembershipByCommunityId(state, communityId));
  const [members, setMembers] = React.useState([]);
  const [editedUserId, setEditedUserId] = React.useState(null);

  const { is_admin: loggedAsGroupAdmin } = membership;

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchMembershipList(communityId);
        setMembers(data);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [communityId, setMembers])


  const handleMemberUpdated = (updatedMembership) => {
    const memberIndex = members.findIndex(m => m.user.id === updatedMembership.user.id);
    const newMembers = [
      ...members.slice(0, memberIndex), 
      updatedMembership,
      ...members.slice(memberIndex + 1)
    ]
    setMembers(newMembers);
    setEditedUserId(null);
  }

  const handleMemberDeleted = (userId) => {
    const memberIndex = members.findIndex(m => m.user.id === userId);
    let newMembers = members.slice();
    newMembers.splice(memberIndex, 1);
    setMembers(newMembers);
    setEditedUserId(null);
  }

  return (
    <div>
      <h2 className="heading heading--1">
        Group Members
      </h2>
      {
        editedUserId
        ? <div>
            <button onClick={() => setEditedUserId(null)} 
              className="btn btn--grey btn--mw150"
            >
             ⏎ back
            </button>
            <EditMember 
              membership={ members.find(m => m.user.id === editedUserId) } 
              onMemberUpdate={ updatedMembership => handleMemberUpdated(updatedMembership) }
              onMemberDelete={ () => handleMemberDeleted(editedUserId) }
            />
          </div>
        : <div>
            <h3 className="heading heading--2">
              Members List
            </h3>
            <MembersTable 
              members={ members } 
              loggedAsGroupAdmin={ loggedAsGroupAdmin } 
              onEditMember={ userId => setEditedUserId(userId) }
            />
          </div>
      }
    </div>
  )
}

export default MembersPage;