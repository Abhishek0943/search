import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApiCall, patchApiCall, postApiCall } from '../api';

export const RecruiterGetWelcomeScreen = createAsyncThunk<WelcomeScreenResponse | ErrorResponse>(
  'GetWelcomeScreen',
  () => getApiCall<WelcomeScreenResponse>('welcome'),
);
export const RecruiterGetCountries = createAsyncThunk<GetCountriesResponse | ErrorResponse>(
  'GetCountries',
  () => getApiCall<GetCountriesResponse>('country'),
);
export const RecruiterRegister = createAsyncThunk<{ success: true, token: string } | ErrorResponse, { acn_number: string, abn_number: string, first_name: string, last_name: string, email: string, password: string, password_confirmation: string, terms_of_use: boolean }>(
  'RecruiterRegister',
  (body) => postApiCall<{ success: true, token: string }>('/auth/jobseekers/register', body),
);
export const RecruiterRecruiterVerification = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, code: string }>(
  'RecruiterVerification',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/otp/verify', body),
);
export const RecruiterRecruiterReSentOtp = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string }>(
  'RecruiterReSentOtp',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/otp/resend', body),
);



export const RecruiterTokenLogin = createAsyncThunk<{ success: true, recruiter: Recruiter, } | ErrorResponse, { token: string, }>(
  'TokenLogin',
  (body) => postApiCall<{ success: true, recruiter: Recruiter }>('recruiter/tokenLogin', body),
);
export const RecruiterCompleteSteps = createAsyncThunk<{ success: true, recruiter: Recruiter, } | ErrorResponse, { id: string, dob?: string, gender?: string, phone?: string, name?: string, step: number, countryId?: string, topics?: string[] }>(
  'CompleteSteps',
  ({ step, ...body }) => patchApiCall<{ success: true, recruiter: Recruiter, token: string }>('recruiter/' + step, body),
);
export const RecruiterGetTopics = createAsyncThunk<{ success: true, topic: TopicItem[], } | ErrorResponse>(
  'GetTopics',
  () => getApiCall<{ success: true, topic: TopicItem[], token: string }>('topic'),
);
export const RecruiterLoginByPassword = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'LoginByPassword',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/login', body),
);
const initialState: RecruiterInitialState = {
  isAuth: false,
  welcomeScreen: [],
  countries: [],
  topic: [],
};
export const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
  },
  // extraReducers: builder => {
  //   builder.addCase(GetWelcomeScreen.fulfilled, (state, { payload }) => {
  //     if (payload.success) {
  //       state.welcomeScreen = payload.welcome;
  //     }
  //   }).addCase(GetCountries.fulfilled, (state, { payload }) => {
  //     if (payload.success) {
  //       state.countries = payload.countries;
  //     }
  //   }).addCase(TokenLogin.fulfilled, (state, { payload }) => {
  //     if (payload.success) {
  //       state.recruiter = payload.recruiter;
  //       if (Number(payload.recruiter.step) === 7) {
  //         state.isAuth = true
  //       }
  //     }
  //   }).addCase(LoginByPassword.fulfilled, (state, { payload }) => {
  //     if (payload.success) {
  //       state.recruiter = payload.recruiter;
  //       if (Number(payload.recruiter.step) === 7) {
  //         state.isAuth = true
  //       }
  //     }
  //   })
  //     .addCase(CompleteSteps.fulfilled, (state, { payload }) => {
  //       if (payload.success) {
  //         if (Number(payload.recruiter.step) === 7) {
  //           state.isAuth = true
  //         }
  //       }
  //     })
  //     .addCase(RecruiterVerification.fulfilled, (state, { payload }) => {
  //       if (payload.success) {
  //         state.recruiter = payload.recruiter;
  //       }
  //     })
  //     .addCase(GetTopics.fulfilled, (state, { payload }) => {
  //       if (payload.success) {
  //         state.topic = payload.topic;
  //       }
  //     })
  // },
});
export default recruiterSlice.reducer;
