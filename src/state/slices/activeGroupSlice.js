import { createSlice } from '@reduxjs/toolkit';


const activeGroupSlice = createSlice({
  name: 'group',
  initialState: {
    id: null,
  },
  reducers: {
    setActiveGroupId(state, { payload: id }) {
      state.id = id;
    }
  },
});


export default activeGroupSlice.reducer;
export const { setActiveGroupId } = activeGroupSlice.actions;
export const selectActiveGroupId = state => state.activeGroup.id;