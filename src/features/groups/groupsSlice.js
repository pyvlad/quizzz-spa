import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { fetchUserCommunities, fetchJoinCommunity, clientError } from 'api';


export const fetchUserGroupsThunk = createAsyncThunk(
  'groups/fetchUserGroups', 
  async (userId, { rejectWithValue }) => {
    try {
      return await fetchUserCommunities(userId);
    } catch(e) {
      return rejectWithValue(clientError(e));
    }
  }
)

export const fetchJoinGroupThunk = createAsyncThunk(
  'groups/fetchJoinGroup', 
  async ({ name, password }, { rejectWithValue }) => {
    try {
      return await fetchJoinCommunity({ name, password });
    } catch(e) {
      return rejectWithValue(clientError(e));
    }
  }
)


const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    loading: false, 
    error: '',
  }, 
  reducers: {},
  extraReducers: {
    [fetchUserGroupsThunk.pending]: (state, action) => {
      state.loading = true;
      state.error = '';
    },
    [fetchUserGroupsThunk.fulfilled]: (state, action) => {
      state.loading = false;
      state.groups = action.payload;
    },
    [fetchUserGroupsThunk.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [fetchJoinGroupThunk.pending]: state => {
      state.loading = true;
      state.error = '';
    },
    [fetchJoinGroupThunk.fulfilled]: (state, action) => {
      state.loading = false;
      state.groups.push(action.payload);
    },
    [fetchJoinGroupThunk.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
  }
});


export default groupsSlice.reducer;

export const selectUserGroups = state => state.groups.groups;
export const selectUserGroupsLoading = state => state.groups.loading;
export const selectUserGroupsError = state => state.groups.error;