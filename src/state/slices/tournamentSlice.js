import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectActiveGroupId } from './activeGroupSlice';
import { logout } from './authSlice';
import * as api from 'api';


/* *** THUNKS *** */
export const fetchTournament = createAsyncThunk(
  'tournament/fetch', 
  async (tournamentId, { rejectWithValue,  getState }) => {
    try {
      const groupId = selectActiveGroupId(getState());
      return await api.getTournament(groupId, tournamentId);
    } catch(e) {
      return rejectWithValue(e);
    }
  }
)


/* *** SLICE *** */
const initialState = {
  tournament: {},
  status: 'idle',  // idle / loading / ok / failed
  error: '',
  activeId: null,
}

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    setActiveTournamentId(state, action) {
      return {
        ...initialState,
        activeId: action.payload
      }
    }
  },
  extraReducers: {
    [fetchTournament.pending]: state => ({
      ...state, 
      status: 'loading', 
      error: '',
    }),
    [fetchTournament.fulfilled]: (state, action) => {
      state.status = 'ok';
      state.tournament = action.payload;
    },
    [fetchTournament.rejected]: (state, action) => ({
        ...state, 
        status: 'failed', 
        error: action.payload.message,
    }),

    [logout]: () => initialState,  // reset on logout
  },
});

export default tournamentSlice.reducer;

export const { setActiveTournamentId } = tournamentSlice.actions;

/* *** SELECTORS *** */
export const selectTournament = state => state.tournament.tournament;
export const selectTournamentLoading = state => state.tournament.status === 'loading';
export const selectTournamentStatus = state => state.tournament.status;
export const selectTournamentError = state => state.tournament.error;
export const selectActiveTournamentId = state => state.tournament.activeId;