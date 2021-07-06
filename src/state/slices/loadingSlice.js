import { createSlice } from '@reduxjs/toolkit';


const loadingSlice = createSlice({
  name: 'loading',

  initialState: {
    count: 0,     // ongoing "showLoadingOverlay" call count
  },

  reducers: {
    showLoadingOverlay(state, action) {
      state.count += 1;
    },
    hideLoadingOverlay(state, action) {
      state.count -= 1;
    }
  },
});


export default loadingSlice.reducer;
export const { showLoadingOverlay, hideLoadingOverlay } = loadingSlice.actions;
export const selectIsLoading = state => state.loading.count > 0;