import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';
import { selectMyMembershipByGroupId } from 'state';

import MembersTable from './Table';
import FormWrapper from './FormWrapper';
import EditMemberForm from './EditMemberForm';
import DeleteMemberButton from './DeleteMemberButton';


const MembersPage = () => {

  const groupId = useSelector(selectActiveGroupId);

  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const { is_admin: loggedAsGroupAdmin } = membership;

  const [members, setMembers] = React.useState([]);
  const [editedUserId, setEditedUserId] = React.useState(null);

  // On mount, fetch list of group members
  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getCommunityMembers(groupId);
        setMembers(data);
      } catch(e) {
        console.log(e);
      }
    }
    fetchData();
  }, [groupId, setMembers])


  const handleMemberUpdated = (updatedMembership) => {
    const memberIndex = members.findIndex(m => m.user.id === updatedMembership.user.id);
    const newMembers = [
      ...members.slice(0, memberIndex), 
      updatedMembership,
      ...members.slice(memberIndex + 1)
    ]
    setEditedUserId(null);
    setMembers(newMembers);
  }

  const handleMemberDeleted = (userId) => {
    const memberIndex = members.findIndex(m => m.user.id === userId);
    let newMembers = members.slice();
    newMembers.splice(memberIndex, 1);
    setEditedUserId(null);
    setMembers(newMembers);
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
            <FormWrapper>
              <EditMemberForm
                membership={ members.find(m => m.user.id === editedUserId) } 
                onMemberUpdate={ updatedMembership => handleMemberUpdated(updatedMembership) }
              />
              <DeleteMemberButton
                membership={ members.find(m => m.user.id === editedUserId) }
                onMemberDelete={ () => handleMemberDeleted(editedUserId) }
              />
            </FormWrapper>
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