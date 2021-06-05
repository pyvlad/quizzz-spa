import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { selectCurrentUser, fetchLogout } from './authSlice';
import * as api from 'api';


/* *** THUNKS *** */
export const fetchMyMemberships = createAsyncThunk(
  'myGroups/fetchMyMemberships', 
  async (_, { rejectWithValue,  getState }) => {
    try {
      const userId = selectCurrentUser(getState()).id;
      return await api.getUserMemberships(userId);
    } catch(e) {
      return rejectWithValue(e);
    }
  }
)


/* *** SLICE *** */
const onRequestStart = state => ({
  ...state, 
  status: 'loading', 
  error: '',
});

const onRequestFail = (state, action) => {
  return {
    ...state, 
    status: 'failed', 
    error: action.payload.message,
  };
};

const initialState = {
  entities: [],
  status: 'idle',  // idle / loading / ok / failed
  error: '',
  activeId: null,
}

const myGroupsSlice = createSlice({
  name: 'myGroups',
  initialState,
  reducers: {
    addMembership(state, { payload: membership }) {
      state.entities.push(membership);
    },
    deleteMembership(state, { payload: communityId }) {
      const i = state.entities.findIndex(x => (x.community.id === communityId));
      state.entities.splice(i, 1);
    },
    updateGroup(state, { payload: community }) {
      const i = state.entities.findIndex(x => (x.community.id === community.id));
      state.entities[i].community = community;
    },
  },
  extraReducers: {
    [fetchMyMemberships.pending]: onRequestStart,
    [fetchMyMemberships.fulfilled]: (state, action) => {
      state.status = 'ok';
      state.entities = action.payload;
    },
    [fetchMyMemberships.rejected]: onRequestFail,

    [fetchLogout.fulfilled]: () => initialState,  // reset on logout
  },
});

export default myGroupsSlice.reducer;


/* *** ACTIONS *** */
export const { 
  addMembership,
  deleteMembership,
  updateGroup,
} = myGroupsSlice.actions;


/* *** SELECTORS *** */
export const selectMyMemberships = state => state.myGroups.entities;
export const selectMyMembershipByGroupId = (state, id) => {
  return state.myGroups.entities.find(g => g.community.id === id);
}
export const selectMyGroupById = (state, id) => {
  const membership = state.myGroups.entities.find(g => g.community.id === id);
  return membership ? membership.community : null;
}
export const selectMyGroupsLoading = state => state.myGroups.status === 'loading';
export const selectMyGroupsStatus = state => state.myGroups.status;
export const selectMyGroupsError = state => state.myGroups.error;