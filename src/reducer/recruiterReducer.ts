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
  (body) => postApiCall<{ success: true, token: string }>('/auth/companies/register', body),
);
export const RecruiterRecruiterVerification = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, code: string }>(
  'RecruiterVerification',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/otp/verify', body),
);
export const RecruiterRecruiterReSentOtp = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string }>(
  'RecruiterReSentOtp',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/recruiter/otp/resend', body),
);

export const RecruiterTokenLogin = createAsyncThunk<{ success: true, recruiter: Recruiter, } | ErrorResponse, { token: string, }>(
  'TokenLogin',
  (body) => postApiCall<{ success: true, recruiter: Recruiter }>('recruiter/tokenLogin', body),
);
export const RecruiterCompleteSteps = createAsyncThunk<{ success: true, recruiter: Recruiter, } | ErrorResponse, { id: string, dob?: string, gender?: string, phone?: string, name?: string, step: number, countryId?: string, topics?: string[] }>(
  'CompleteSteps',
  ({ step, ...body }) => patchApiCall<{ success: true, recruiter: Recruiter, token: string }>('recruiter/' + step, body),
);
export const RecruiterProfile = createAsyncThunk<{ success: true, topic: TopicItem[], } | ErrorResponse>(
  'RecruiterProfile',
  () => getApiCall<{ success: true, topic: TopicItem[], token: string }>('/auth/companies/me'),
);
export const RecruiterPlans = createAsyncThunk<{ success: true, topic: TopicItem[], } | ErrorResponse>(
  'RecruiterPlans',
  () => getApiCall<{ success: true, topic: TopicItem[], token: string }>('/company/plans'),
);
export const Tokien = createAsyncThunk<{ success: true, topic: TopicItem[], } | ErrorResponse>(
  'Tokien',
  (body) => postApiCall<{ success: true, topic: TopicItem[], token: string }>('/apple/token', body),
);
export const RecruiterLoginByPassword = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'RecruiterLoginByPassword',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/companies/login', body),
);
export const RecruiterForgetPassword = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'RecruiterForgetPassword',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/companies/password/forgot', body),
);
export const OtpVerify = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'OtpVerify',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/password/verify-otp', body),
);
export const ComOtpVerify = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'ComOtpVerify',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/companies/password/verify-otp', body),
);
export const ResetPassword = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'ResetPassword',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/password/reset', body),
);
export const ComResetPassword = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, password: string }>(
  'ComResetPassword',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/companies/password/reset', body),
);
export const ForgetPassword = createAsyncThunk<{ success: true, recruiter: Recruiter, token: string } | ErrorResponse, { email: string, }>(
  'ForgetPassword',
  (body) => postApiCall<{ success: true, recruiter: Recruiter, token: string }>('/auth/jobseekers/password/forgot', body),
);
export const GetCandidates = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { pages }
>(
  'GetCandidates',
  ({ pages }) => {
    return getApiCall<{ success: true, data: User }>('/company/find-candidates?page=' + pages);
  }
);
export const Followers = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { pages }
>(
  'Followers',
  ({ pages }) => {
    return getApiCall<{ success: true, data: User }>('/company/followers?page=' + pages);
  }
);
export const PaymentHistoryApi = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'Followers',
  () => {
    return getApiCall<{ success: true, data: User }>('/company/get-payment-history');
  }
);
export const JobCandidates = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { job_id: string, status?: string, pages: string }
>(
  'JobCandidates',
  ({ pages, ...body }) => {
    return postApiCall<{ success: true, data: User }>('/company/job-candidates?page=' + pages, body);
  }
);
export const CandidateProfileData = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number, }
>(
  'CandidateProfileData',
  ({ id }) => {
    return getApiCall<{ success: true, data: User }>('/jobseekers/job-seeker-profile?user_id=' + id);
  }
);
export const UpdateStatus = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number, }
>(
  'UpdateStatus',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/company/update-application-status', body);
  }
);
export const SendMessage = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number, }
>(
  'SendMessage',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/company/messages', body);
  }
);
export const SendMessageSeeker = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number, }
>(
  'SendMessage',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/jobseeker/messages', body);
  }
);

export const CandidateProf = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number, }
>(
  'CandidateProf',
  ({ id }) => {
    return getApiCall<{ success: true, data: User }>('/company/applicant-profile/' + id);
  }
);
const initialState: RecruiterInitialState = {
  isAuth: false,
  welcomeScreen: [],
  countries: [],
  topic: [],
  plan: []
};
export const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(RecruiterPlans.fulfilled, (state, { payload }) => {
      if (payload.success) {
        state.plan = payload.data;
      }
    })

  }

  //.addCase(GetCountries.fulfilled, (state, { payload }) => {
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
