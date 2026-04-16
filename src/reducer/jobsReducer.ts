import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteApiCall, getApiCall, patchApiCall, postApiCall, putApiCall } from '../api';
export const GetSuggestedJobs = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetSuggestedJobs',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/suggested-jobs');
  }
);
export const GetBookmarkJobs = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetBookmarkJobs',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/my-favourite-jobs');
  }
);
export const GetRecentJobs = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetRecentJobs',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/jobs');
  }
);
export const GetJobByStatus = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { status: string }
>(
  'GetSuggestedJobs',
  ({ status }) => {
    return getApiCall<{ success: true, data: Job[] }>('/company/posted-jobs/' + status);
  }
);
export const deleteJob = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { status: string }
>(
  'GetSuggestedJobs',
  (body) => {
    return postApiCall<{ success: true, data: Job[] }>('/company/delete-job', body);
  }
);
export const UploadCV = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, {}
>(
  'UploadCV',
  (body) => {
    console.log(body)
    return postApiCall<{ success: true, data: Job[] }>('/jobseekers/cv-save', body, { as: "form" });
  }
);
export const UploadDocument = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, {}
>(
  'UploadDocument',
  (body) => {
    return postApiCall<{ success: true, data: Job[] }>('/company/messages/upload-file', body, { as: "form" });
  }
);
export const GetJobApplication = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { search: string, page: number }
>(
  'GetJobApplication',
  ({ search, page }) => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/my-job-applications?search=' + search + '&page=' + page);
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
export const GetNotification = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'GetNotification',
  () => {
    return getApiCall<{ success: true, data: Job[] }>('/jobseekers/get-notifications',);
  }
);
export const DeleteNotification = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
>(
  'DeleteNotification',
  ({ id }) => {
    return deleteApiCall<{ success: true, data: Job[] }>('/jobseekers/delete-notificatoin/' + id,);
  }
);
export const ApplyJobs = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, {}
>(
  'ApplyJobs',
  (body) => {
    return postApiCall<{ success: true, data: Job[] }>('/jobs/apply', body);
  }
);
export const GetUserLanguages = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse
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
export const DeleteProject = createAsyncThunk<
  { success: true, data: Job[] } | ErrorResponse, { id: number, }
>(
  'DeleteProject',
  ({ id }) => {
    return deleteApiCall<{ success: true, data: Job[] }>(`/jobseeker/projects/${id}`);
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
  { success: true, data: { jobs: Job[] } } | ErrorResponse, { search?: string, job_type_id: number[], job_skill_id: number[], company_id: number[], job_title: string[], job_experience_id: number[], degree_level_id: number[], job_shift_id: number[], gender_id: number[], career_level_id: number[], functional_area_id: number[], city_id: number[], salary_from: number, salary_to: number }
>(
  'GetJobs',
  ({ pages, ...body }) => {
    return postApiCall<{ success: true, data: { jobs: Job[] } }>('/jobseekers/search-jobs?page=' + pages, body);
  }
);
export const DeleteRecruter = createAsyncThunk<
  { success: true, data: { jobs: Job[] } } | ErrorResponse, { search?: string, job_type_id: number[], job_skill_id: number[], company_id: number[], job_title: string[], job_experience_id: number[], degree_level_id: number[], job_shift_id: number[], gender_id: number[], career_level_id: number[], functional_area_id: number[], city_id: number[], salary_from: number, salary_to: number }
>(
  'DeleteRecruter',
  ({ ...body }) => {
    return postApiCall<{ success: true, data: { jobs: Job[] } }>('/company/delete-profile', body);
  }
);
export const DeleteSesdkfjds = createAsyncThunk<
  { success: true, data: { jobs: Job[] } } | ErrorResponse, { search?: string, job_type_id: number[], job_skill_id: number[], company_id: number[], job_title: string[], job_experience_id: number[], degree_level_id: number[], job_shift_id: number[], gender_id: number[], career_level_id: number[], functional_area_id: number[], city_id: number[], salary_from: number, salary_to: number }
>(
  'DeleteSesdkfjds',
  ({ ...body }) => {
    return postApiCall<{ success: true, data: { jobs: Job[] } }>('/jobseeker/delete-profile', body);
  }
);
export const GetCompanies = createAsyncThunk<
  { success: true, data: { companies: Company[] } } | ErrorResponse, { pages?: number }
>(
  'GetCompanies',
  ({ pages }) => {
    return getApiCall<{ success: true, data: { companies: Company[] } }>('/jobseekers/company-list?page=' + (pages || 1));
  }
);
export const GetFavoriteCompanies = createAsyncThunk<
  { success: true, data: { companies: Company[] } } | ErrorResponse
>(
  'GetFavoriteCompanies',
  ({ pages }) => {
    return getApiCall<{ success: true, data: { companies: Company[] } }>('/jobseekers/my-favourite-companies?page=' + (pages || 1));
  }
);
export const ContactT = createAsyncThunk<
  { success: true, data: { companies: Company[] } } | ErrorResponse, {}
>(
  'Contact',
  (body) => {
    return postApiCall<{ success: true, data: { companies: Company[] } }>('/contact-us', body);
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
export const Bookmark = createAsyncThunk<
  { success: true, data: Company } | ErrorResponse, { id: number }
>(
  'Bookmark',
  ({ id }) => {
    return postApiCall<{ success: true, data: Company }>('/jobseekers/add-to-favourite-job/' + id, {});
  }
);
export const Favorite = createAsyncThunk<
  { success: true, data: Company } | ErrorResponse, { id: number }
>(
  'Favorite',
  ({ id }) => {
    return postApiCall<{ success: true, data: Company }>('/jobseekers/add-to-favourite-company/' + id, {});
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
export const ReportJob = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : Job
    }
  } | ErrorResponse, { your_email: string, your_name: string, job_url: string }
>(
  'ReportJob',
  (body) => {
    return postApiCall<{
      success: true, data: {
        jobDetail
        : Job
      }
    }>('/report-abuses-job', body);
  }
);
export const ReportCompany = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : Job
    }
  } | ErrorResponse, { your_email: string, your_name: string, company_url: string }
>(
  'ReportCompany',
  (body) => {
    return postApiCall<{
      success: true, data: {
        jobDetail
        : Job
      }
    }>('/report-abuses-company', body);
  }
);
export const DeleteBlog = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : Job
    }
  } | ErrorResponse, { slug: string }
>(
  'DeleteBlog',
  ({ slug }) => {
    return postApiCall('/delete-blog/' + slug, {});
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
export const GetChatsSeeker = createAsyncThunk<
  { success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } } | ErrorResponse, { search?: string }
>(
  'GetFilter',
  ({ search }) => {
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/jobseeker/chats');
  }
);
export const GetChats = createAsyncThunk<
  { success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } } | ErrorResponse, { search?: string }
>(
  'GetFilter',
  ({ search }) => {
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/company/chats');
  }
);
export const GetMessage = createAsyncThunk<
  { success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } } | ErrorResponse, { search?: string }
>(
  'GetFilter',
  ({ id, pages }) => {
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/company/messages?seeker_id=' + id + '&page=' + pages);
  }
);
export const GetMessageSeeker = createAsyncThunk<
  { success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } } | ErrorResponse, { search?: string }
>(
  'GetFilter',
  ({ id }) => {
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/jobseeker/messages?company_id=' + id);
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
export const ProfileData2 = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'ProfileData2',
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
export const JobTypes = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'JobTypes',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-job-types');
  }
);
export const JobShifts = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'JobShifts',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-job-shifts');
  }
);
export const NumberOfPositions = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'NumberOfPositions',
  () => {
    return getApiCall<{ success: true, data: User }>('/number-of-positions');
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
export const SalaryPeriods = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'SalaryPeriods',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-salary-periods');
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
export const AddNewJob = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'AddNewJob',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/company/post-new-job', body,);
  }
);
export const EditNewJob = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'EditNewJob',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, data: User }>(`/company/update-job/${id}`, body,);
  }
);
export const UpdateProfile3 = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'UpdateProfile3',
  (body) => {
    return postApiCall<{ success: true, data: User }>('/company/update-profile', body, { as: "form" });
  }
);
export const GetOwnership = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'GetOwnership',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-ownerships',);
  }
);
export const GetNumberOfOffices = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'GetNumberOfOffices',
  () => {
    return getApiCall<{ success: true, data: User }>('/number-of-offices');
  }
);
export const GetNumberOfEmployees = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'GetNumberOfEmployees',
  () => {
    return getApiCall<{ success: true, data: User }>('/number-of-employees',);
  }
);

export const DegreeType = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, { id: number }
>(
  'DegreeType',
  ({ id }) => {
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
  suggested: [],
  recent: [],
  appliedJobIds: []
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
    setAppliedJobId: (state, { payload }) => {
      if (!state.appliedJobIds.includes(payload)) {
        state.appliedJobIds.push(payload);
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(GetSuggestedJobs.fulfilled, (state, { payload }) => {
        if (payload.success) {
          state.suggested = payload.data
        }
      })
      .addCase(GetRecentJobs.fulfilled, (state, { payload }) => {
        if (payload.success) {
          state.recent = payload.data
        }
      })
  }
});



export const { setAppliedJobId } = jobSlice.actions;
export default jobSlice.reducer;
