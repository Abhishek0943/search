import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isGuestLogin: boolean;
  isLogin: boolean;
}

const initialState: AuthState = {
  isGuestLogin: true,
  isLogin: false, 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateIsGuestLogin: (state, action: PayloadAction<boolean>) => {
      state.isGuestLogin = action.payload;
    },
    updateIsLogin: (state, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
    },
  },
});

export const { updateIsGuestLogin ,updateIsLogin} = authSlice.actions;

export default authSlice.reducer;
