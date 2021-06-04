import { createSlice } from '@reduxjs/toolkit';


const communitySlice = createSlice({
  name: 'community',
  initialState: {
    activeId: null,
  },
  reducers: {
    setActiveCommunityId(state, { payload: id }) {
      state.activeId = id;
    }
  },
});


export default communitySlice.reducer;
export const { setActiveCommunityId } = communitySlice.actions;
export const selectActiveCommunityId = state => state.community.activeId;