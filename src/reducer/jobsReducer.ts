import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteApiCall, getApiCall, patchApiCall, postApiCall, putApiCall } from '../api';
export const GetSuggestedJobs = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetSuggestedJobs',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/jobs');
  }
);
export const GetRecentJobs = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetSuggestedJobs',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/jobs');
  }
);
export const UploadCV = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, {}
>(
  'UploadCV',
  (body) => {
    return postApiCall<{ success: true, data: Job[] }>('/jobseekers/cv-save', body, { as: "form" });
  }
);
export const GetCv = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { id: number }
>(
  'GetCv',
  ({ id }) => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/get-cvs?user_id=' + id,);
  }
);
export const GetUserLanguages = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse,
>(
  'GetUserLanguages',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseeker/languages');
  }
);
export const PostUserLanguages = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, {}
>(
  'PostUserLanguages',
  (data) => {
    return postApiCall<{ success: true, data: Job[] }>('/jobseeker/languages', data);
  }
);
export const GetExperience = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetExperience',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseeker/experiences',);
  }
);
export const DeleteCv = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { id: number, cvid: number }
>(
  'DeleteCv',
  ({ id, cvid }) => {
    return deleteApiCall<{ success: true, data: Job[] }>(`/jobseekers/cv-delete?cv_id=${cvid}&user_id=${id}`);
  }
);
export const DeleteExperience = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { id: number, }
>(
  'DeleteExperience',
  ({ id }) => {
    return deleteApiCall<{ success: true, data: Job[] }>(`/jobseeker/experiences/${id}`);
  }
);
export const DeleteEducation = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { id: number, }
>(
  'DeleteEducation',
  ({ id }) => {
    return deleteApiCall<{ success: true, data: Job[] }>(`/jobseeker/educations/${id}`);
  }
);
export const GetJobs = createAsyncThunk<
  { success: true, data: { jobs: Job[] } } | ErrorResponse, { search?: string }
>(
  'GetJobs',
  ({ search }) => {
    return getApiCall<{ success: true, data: { jobs: Job[] } }>('/jobseekers/search-jobs?search=' + search);
  }
);
export const GetCompanies = createAsyncThunk<
  { success: true, data: { companies: Company[] } } | ErrorResponse
>(
  'GetCompanies',
  () => {
    return getApiCall<{ success: true, data: { companies: Company[] } }>('/jobseekers/company-list');
  }
);
export const GetCompany = createAsyncThunk<
  { success: true, data: Company } | ErrorResponse, { id: number }
>(
  'GetCompany',
  ({ id }) => {
    return getApiCall<{ success: true, data: Company }>('/jobseekers/company-detail/' + id);
  }
);
export const GetJob = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : Job
    }
  } | ErrorResponse, { id: string | number }
>(
  'GetJob',
  ({ id }) => {
    return getApiCall<{
      success: true, data: {
        jobDetail
        : Job
      }
    }>('/jobseekers/job/' + id);
  }
);
export const GetFilter = createAsyncThunk<
  { success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } } | ErrorResponse, { search?: string }
>(
  'GetFilter',
  ({ search }) => {
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/jobseekers/job-filters');
  }
);
export const ProfileData = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'ProfileData',
  () => {
    return getApiCall<{ success: true, data: User }>('/auth/jobseekers/me');
  }
);

export const GetGender = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'GetGender',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-genders');
  }
);
export const GetCountry = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'GetCountry',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-counteries');
  }
);
export const Career = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'Career',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-career-levels');
  }
);
export const Experiences = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'Experiences',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-job-experiences');
  }
);
export const Industries = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'Industries',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-industries');
  }
);
export const GetNationalities = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'GetNationalities',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-nationalities');
  }
);
export const FunctionalAria = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'FunctionalAria',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-functional-areas');
  }
);
export const GetState = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number }
>(
  'GetState',
  ({ id }) => {
    return getApiCall<{ success: true, data: User }>('/get-states?country_id=' + id);
  }
);
export const Currencies = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'GetState',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-currencies');
  }
);
export const Update = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'Update',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/jobseekers/user/profile/update', body);
  }
);
export const GetCity = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number }
>(
  'GetCity',
  ({ id }) => {
    return getApiCall<{ success: true, data: User }>('/get-cities?state_id=' + id);
  }
);
export const GetEducation = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'GetEducation',
  () => {
    return getApiCall<{ success: true, data: User }>('/jobseeker/educations');
  }
);
export const DegreeLevel = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'DegreeLevel',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-degree-levels');
  }
);

export const DegreeType = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number }
>(
  'DegreeType',
  ({ id }) => {
    console.log(id)
    return getApiCall<{ success: true, data: User }>('/get-degree-types?degree_level_id=' + id);
  }
);
export const AddEducation = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'AddEducation',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/jobseeker/educations', body);
  }
);
export const editEducation = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'editEducation',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, data: User }>('/jobseeker/educations/' + id, body);
  }
);
export const Subject = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'Subject',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-major-subjects');
  }
);
export const ResultType = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'ResultType',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-result-types');
  }
);





export const LikeJob = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, { _id: string, isLiked: boolean }
>(
  'LikeJob',
  ({ _id, isLiked }) => {
    return patchApiCall<{ success: true, jobs: Job[], }>('job/' + _id + "/like", { isLiked });
  }
);
export const BookmarkJob = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, { _id: string, isBookmarked: boolean }
>(
  'LikeJob',
  ({ _id, isBookmarked }) => {
    return patchApiCall<{ success: true, jobs: Job[], }>('job/' + _id + "/bookmark", { isBookmarked });
  }
);
export const RejobJob = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, { _id: string, isRejobed: boolean }
>(
  'LikeJob',
  ({ _id, isRejobed }) => {
    return patchApiCall<{ success: true, jobs: Job[], }>('job/' + _id + "/rejob", { isRejobed });
  }
);
export const AddWorkExperience = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'AddWorkExperience',
  (body) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseeker/experiences', body);
  }
);
export const AddProject = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'AddProject',
  (body) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseeker/projects', body, { as: "form" });
  }
);
export const UpdateProfile = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'UpdateProfile',
  (body) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseekers/update/image', body, { as: "form" });
  }
);
export const GetProject = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse
>(
  'GetProject',
  () => {
    return getApiCall<{ success: true, jobs: Job[], }>('/jobseeker/projects');
  }
);
export const GetSkills = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse
>(
  'GetSkills',
  () => {
    return getApiCall<{ success: true, jobs: Job[], }>('/get-all-job-skills');
  }
);
export const AddSkill = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'AddSkill',
  (body) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseeker/skills', body);
  }
);
export const EditSkill = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'EditSkill',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseeker/skills/' + id, body);
  }
);
export const EditLanguage = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'EditSkill',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseeker/languages/' + id, body);
  }
);
export const GetUserSkill = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse
>(
  'GetUserSkill',
  () => {
    return getApiCall<{ success: true, jobs: Job[], }>('/jobseeker/skills');
  }
);
export const DeleteUserSkill = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, { id: string }
>(
  'DeleteUserSkill',
  ({ id }) => {
    return deleteApiCall<{ success: true, jobs: Job[], }>('/jobseeker/skills/' + id);
  }
);
export const DeleteUserLanguage = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, { id: string }
>(
  'DeleteUserLanguage',
  ({ id }) => {
    return deleteApiCall<{ success: true, jobs: Job[], }>('/jobseeker/languages/' + id);
  }
);
export const GetLanguages = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse
>(
  'GetLanguages',
  () => {
    return getApiCall<{ success: true, jobs: Job[], }>('/get-all-languages');
  }
);
export const GetLanguagesLevel = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse
>(
  'GetLanguagesLevel',
  () => {
    return getApiCall<{ success: true, jobs: Job[], }>('/get-all-language-lavels');
  }
);
export const GetExperienceLevels = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse
>(
  'GetExperienceLevels',
  () => {
    return getApiCall<{ success: true, jobs: Job[], }>('/get-all-job-experinces');
  }
);
export const EditWorkExperience = createAsyncThunk<
  { success: true, jobs: Job[] } | ErrorResponse, {}
>(
  'AddWorkExperience',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, jobs: Job[], }>('/jobseeker/experiences/' + id, body);
  }
);

const initialState: JobInitialState = {
  users: {
    userObject: {},
    userIds: [],
  },

  jobs: {
    jobObject: {},
    jobIds: [],
  },
};
const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // likeReducers: (state, { payload }) => {
    //   if (state.jobs.jobObject[payload._id].isLiked) {
    //     state.jobs.jobObject[payload._id].isLiked = false
    //     state.jobs.jobObject[payload._id].likesCount = state.jobs.jobObject[payload._id].likesCount - 1
    //   }
    //   else {
    //     state.jobs.jobObject[payload._id].isLiked = true
    //     state.jobs.jobObject[payload._id].likesCount = state.jobs.jobObject[payload._id].likesCount ? state.jobs.jobObject[payload._id].likesCount + 1 : 1
    //   }
    // },
    // bookmarkReducers: (state, { payload }) => {
    //   if (state.jobs.jobObject[payload._id].isBookmarked) {
    //     state.jobs.jobObject[payload._id].isBookmarked = false
    //     state.jobs.jobObject[payload._id].bookmarksCount = state.jobs.jobObject[payload._id].bookmarksCount - 1
    //   }
    //   else {
    //     state.jobs.jobObject[payload._id].isBookmarked = true
    //     state.jobs.jobObject[payload._id].bookmarksCount = state.jobs.jobObject[payload._id].bookmarksCount ? state.jobs.jobObject[payload._id].bookmarksCount + 1 : 1
    //   }
    // },
    // rejobReducers: (state, { payload }) => {
    //   if (state.jobs.jobObject[payload._id].isRejobed) {
    //     state.jobs.jobObject[payload._id].isRejobed = false
    //     state.jobs.jobObject[payload._id].rejobCount = state.jobs.jobObject[payload._id].rejobCount - 1
    //   }
    //   else {
    //     state.jobs.jobObject[payload._id].isRejobed = true
    //     state.jobs.jobObject[payload._id].rejobCount = state.jobs.jobObject[payload._id].rejobCount ? state.jobs.jobObject[payload._id].rejobCount + 1 : 1
    //   }
    // },
  },
  extraReducers(builder) {
    builder.addCase(GetSuggestedJobs.fulfilled, (state, { payload }) => {
      // if (payload.success) {
      //   const jobObject: Record<string, Job> = {}
      //   const jobIds: string[] = []
      //   console.log(payload.jobs);
      //   payload.jobs.forEach((job) => {
      //     jobIds.push(job._id)
      //     jobObject[job._id] = job
      //   })
      //   state.jobs.jobIds = jobIds
      //   state.jobs.jobObject = jobObject
      // }
    })
  },
});



// export const { likeReducers, bookmarkReducers, rejobReducers } = jobSlice.actions;

export default jobSlice.reducer;
