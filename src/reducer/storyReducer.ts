import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiCall, patchApiCall, postApiCall } from '../api';

export const AddStory = createAsyncThunk<WelcomeScreenResponse | ErrorResponse>(
  'AddStory',
  () => getApiCall<WelcomeScreenResponse>('welcome'),
);
const initialState: StoryInitialState = {

};
export const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
  },
//   extraReducers: builder => {
//     builder.addCase(GetWelcomeScreen.fulfilled, (state, { payload }) => {
//       if (payload.success) {
//         // state.welcomeScreen = payload.welcome;
//       }
//     })
    
//   },
});
export default storySlice.reducer;
