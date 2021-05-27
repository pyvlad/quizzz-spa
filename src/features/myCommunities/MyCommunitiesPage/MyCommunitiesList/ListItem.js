import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectCurrentUser } from 'features/auth/authSlice';
import { fetchDeleteMembership } from 'api';

import { deleteMembership } from '../../slice';
import 'styles/btn.scss';
import './styles.scss';
import urlFor from 'urls';


const MyCommunitiesListItem = ({ membership }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { 
    is_admin: isGroupAdmin, 
    community: { 
      id,
      name
    } = {} 
  } = membership;

  const handleLeaveCommunity = async (e) => {
    e.preventDefault();

    if (!isLoading) {

      const confirmed = window.confirm("Are you sure you want to leave this group?")
      if (!confirmed) return;

      setErrors({});
      setIsLoading(true);
      
      try {
        await fetchDeleteMembership(id, currentUser.id);
        dispatch(deleteMembership(id));
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);
    }
  }

  return (
    <li className="groups__li">
      <Link to={ urlFor("COMMUNITY_HOME", {communityId: id}) } 
        className="groups__li-link groups__li-link--with-actions" 
      >
        { name }
      </Link>
      <div className="groups__li-actions">
        {
          isGroupAdmin
          ? <Link to={ urlFor("EDIT_COMMUNITY", {communityId: id}) } 
              className="btn btn--grey btn--rounded" 
            >
              Edit
            </Link>
          : <button onClick={ handleLeaveCommunity } className="btn btn--red btn--rounded">
              Leave
            </button>
        }
      </div>
    </li>
  )
}

export default MyCommunitiesListItem;