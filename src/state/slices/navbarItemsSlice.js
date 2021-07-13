import { createSlice } from '@reduxjs/toolkit';


const loadingSlice = createSlice({
  name: 'navbarItems',

  initialState: [],

  reducers: {
    setNavbarItems(state, action) {
      return action.payload;
    },
    pushNavbarItem(state, action) {
      state.push(action.payload);
    },
    popNavbarItem(state) {
      state.pop();
    }
  },
});


export default loadingSlice.reducer;
export const { setNavbarItems, pushNavbarItem, popNavbarItem } = loadingSlice.actions;
export const selectNavbarItems = state => state.navbarItems;