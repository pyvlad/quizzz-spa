import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveGroupId } from 'state';

import * as api from 'api';
import { selectMyMembershipByGroupId } from 'state';
import urlFor from 'urls';

import MembersTable from './Table';
import FormWrapper from './FormWrapper';
import EditMemberForm from './EditMemberForm';
import DeleteMemberButton from './DeleteMemberButton';
import useListUpdateDeleteViews from 'common/useListUpdateDeleteViews';
import { useGroupPageTitle } from 'common/useTitle';
import { useNavbarItem } from 'common/Navbar';
import { useFetchedListOfItems } from 'common/useApi';


const MembersPage = () => {

  // globals
  const groupId = useSelector(selectActiveGroupId);
  const membership = useSelector(state => selectMyMembershipByGroupId(state, groupId));
  const { is_admin: loggedAsGroupAdmin } = membership;

  // page title
  useGroupPageTitle(groupId, "Members");

  // page navbar item
  const getItem = React.useCallback(() => ({
    text: "Members", 
    url: urlFor("GROUP_MEMBERS", {groupId}), 
    isName: false
  }), [groupId]);
  useNavbarItem(getItem);

  // fetch members on component mount
  const apiFunc = React.useCallback(async () => await api.getCommunityMembers(groupId), [groupId]);
  const [members, setMembers] = useFetchedListOfItems(apiFunc);

  // update/delete/back views
  const getItemId = item => item.user.id;
  const {
    editedItemId,
    setEditedItemId,
    handleItemUpdated,
    handleItemDeleted,
  } = useListUpdateDeleteViews(members, setMembers, getItemId);

  // return component
  return (
    <div>
      <h2 className="heading heading--1">
        Group Members
      </h2>
      {
        editedItemId
        ? <div>
            <button onClick={() => setEditedItemId(null)} 
              className="btn btn--grey btn--mw150"
            >
             ⏎ back
            </button>
            <FormWrapper>
              <EditMemberForm
                membership={ members.find(m => getItemId(m) === editedItemId) } 
                onMemberUpdate={ handleItemUpdated }
              />
              <DeleteMemberButton
                membership={ members.find(m => getItemId(m) === editedItemId) }
                onMemberDelete={ () => handleItemDeleted(editedItemId) }
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
              onEditMember={ userId => setEditedItemId(userId) }
            />
          </div>
      }
    </div>
  )
}

export default MembersPage;