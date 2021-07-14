import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectActiveGroupId, selectMyGroupById, selectTournament, 
  popNavbarItem, pushNavbarItem 
} from 'state';
import urlFor from 'urls';


export const useNavbarItem = (getItem) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(pushNavbarItem(getItem()));
    return () => dispatch(popNavbarItem());
  }, [dispatch, getItem]);
}


export const GroupsNavbar = () => {

  const getItem = React.useCallback(() => ({
    text: "Groups", 
    url: urlFor("MY_GROUPS"), 
    isName: false
  }), []);

  useNavbarItem(getItem);
  return "";
}


export const ActiveGroupNavbar = () => {

  const groupId = useSelector(selectActiveGroupId);
  const group = useSelector(state => selectMyGroupById(state, groupId));
  const groupName = group.name;

  const getItem = React.useCallback(() => ({
    text: groupName, 
    url: urlFor("GROUP_HOME", {groupId}), 
    isName: true
  }), [groupName, groupId]);

  useNavbarItem(getItem);
  return "";
}


export const TournamentsNavbar = () => {

  const groupId = useSelector(selectActiveGroupId);

  const getItem = React.useCallback(() => ({
    text: "Tournaments", 
    url: urlFor("GROUP_TOURNAMENTS", {groupId}), 
    isName: false
  }), [groupId]);

  useNavbarItem(getItem);
  return "";
}


export const ActiveTournamentNavbar = () => {

  const groupId = useSelector(selectActiveGroupId);
  const tournament = useSelector(selectTournament);
  const tournamentName = tournament.name;
  const tournamentId = tournament.id;

  const getItem = React.useCallback(() => ({
    text: tournamentName, 
    url: urlFor("TOURNAMENT_ROUNDS", {groupId, tournamentId}), 
    isName: true
  }), [groupId, tournamentId, tournamentName]);

  useNavbarItem(getItem);
  return "";
}