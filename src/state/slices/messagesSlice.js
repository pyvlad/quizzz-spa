import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';


const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    entities: [],
  },
  reducers: {
    addMessage(state, { payload: message }) {
      state.entities.push(message);
    },
    removeMessage(state, { payload: id }) {
      const i = state.entities.findIndex(x => (x.id === id));
      state.entities.splice(i, 1);
    },
  }
});


export default messagesSlice.reducer;
export const selectMessages = state => state.messages.entities;
export const { addMessage, removeMessage } = messagesSlice.actions;
export const showMessage = (message, type='info', timeout=3000) => dispatch => {
  const item = {
    message, 
    type,
    timeout,
    id: nanoid()
  };
  dispatch(addMessage(item));
}