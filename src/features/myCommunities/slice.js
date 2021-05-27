import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { selectCurrentUser, fetchLogout } from 'features/auth/authSlice';
import * as api from 'api';


/* *** THUNKS *** */
export const fetchMyMemberships = createAsyncThunk(
  'myCommunities/fetchMyMemberships', 
  async (_, { rejectWithValue,  getState }) => {
    try {
      const userId = selectCurrentUser(getState()).id;
      return await api.fetchUserMemberships(userId);
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
}

const myCommunitiesSlice = createSlice({
  name: 'myCommunities',
  initialState,
  reducers: {
    addMembership(state, { payload: membership }) {
      state.entities.push(membership);
    },
    deleteMembership(state, { payload: communityId }) {
      const i = state.entities.findIndex(x => (x.community.id === communityId));
      state.entities.splice(i, 1);
    },
    updateCommunity(state, { payload: community }) {
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

export default myCommunitiesSlice.reducer;


/* *** ACTIONS *** */
export const { addMembership, deleteMembership, updateCommunity } = myCommunitiesSlice.actions;


/* *** SELECTORS *** */
export const selectMyMemberships = state => state.myCommunities.entities;
export const selectMyMembershipByCommunityId = (state, id) => {
  return state.myCommunities.entities.find(g => g.community.id === id);
}
export const selectMyCommunityById = (state, id) => {
  const membership = state.myCommunities.entities.find(g => g.community.id === id);
  return membership ? membership.community : null;
}
export const selectMyCommunitiesLoading = state => state.myCommunities.status === 'loading';
export const selectMyCommunitiesStatus = state => state.myCommunities.status;
export const selectMyCommunitiesError = state => state.myCommunities.error;