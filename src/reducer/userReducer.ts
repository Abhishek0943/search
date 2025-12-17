import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiCall, patchApiCall, postApiCall } from '../api';
import { ProfileData } from './jobsReducer';

export const GetWelcomeScreen = createAsyncThunk<WelcomeScreenResponse | ErrorResponse>(
  'GetWelcomeScreen',
  () => getApiCall<WelcomeScreenResponse>('welcome'),
);
export const GetCountries = createAsyncThunk<GetCountriesResponse | ErrorResponse>(
  'GetCountries',
  () => getApiCall<GetCountriesResponse>('country'),
);
export const UserRegister = createAsyncThunk<{ success: true, token: string } | ErrorResponse, {first_name:string, last_name:string, email:string, password:string, password_confirmation:string, terms_of_use:boolean}>(
  'UserRegister',
  (body) => postApiCall<{ success: true, token: string }>('/auth/jobseekers/register', body),
);
export const UserVerification = createAsyncThunk<{ success: true, user: User, token: string } | ErrorResponse, { email: string, code: string }>(
  'UserVerification',
  (body) => postApiCall<{ success: true, user: User, token: string }>('/auth/jobseekers/otp/verify', body),
);
export const UserReSentOtp = createAsyncThunk<{ success: true, user: User, token: string } | ErrorResponse, { email: string }>(
  'UserReSentOtp',
  (body) => postApiCall<{ success: true, user: User, token: string }>('/auth/jobseekers/otp/resend', body),
);



export const TokenLogin = createAsyncThunk<{ success: true, user: User, } | ErrorResponse, { token: string, }>(
  'TokenLogin',
  (body) => postApiCall<{ success: true, user: User  }>('user/tokenLogin', body),
);
export const CompleteSteps = createAsyncThunk<{ success: true, user: User, } | ErrorResponse, { id: string, dob?: string, gender?: string, phone?: string, name?: string, step: number, countryId?: string, topics?: string[] }>(
  'CompleteSteps',
  ({ step, ...body }) => patchApiCall<{ success: true, user: User, token: string }>('user/' + step, body),
);
export const GetTopics = createAsyncThunk<{ success: true, topic: TopicItem[], } | ErrorResponse>(
  'GetTopics',
  () => getApiCall<{ success: true, topic: TopicItem[], token: string }>('topic'),
);
export const LoginByPassword = createAsyncThunk<{success: true,data:{user: User, token: string } } | ErrorResponse, {email:string, password:string}>(
  'LoginByPassword',
  (body) => postApiCall<{ success: true, data:{user: User, token: string } }>('/auth/jobseekers/login', body),
);
const initialState: UserInitialState = {
  isAuth: false,
  welcomeScreen: [],
  countries: [],
  topic: [],
};
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(GetWelcomeScreen.fulfilled, (state, { payload }) => {
      if (payload.success) {
        state.welcomeScreen = payload.welcome;
      }
    }).addCase(GetCountries.fulfilled, (state, { payload }) => {
      if (payload.success) {
        state.countries = payload.countries;
      }
    }).addCase(ProfileData.fulfilled, (state, { payload }) => {
      if (payload.success) {
        state.user = payload.data;
      
      }
    }).addCase(LoginByPassword.fulfilled, (state, { payload }) => {
      if (payload.success) {
        state.user = payload.data.user;
        state.isAuth = true
        
      }
    })
      .addCase(CompleteSteps.fulfilled, (state, { payload }) => {
        if (payload.success) {
          
        }
      })
      .addCase(UserVerification.fulfilled, (state, { payload }) => {
        if (payload.success) {
          state.user = payload.user;
        }
      })
      .addCase(GetTopics.fulfilled, (state, { payload }) => {
        if (payload.success) {
          state.topic = payload.topic;
        }
      })
  },
});
export default userSlice.reducer;
