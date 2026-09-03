import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteApiCall, getApiCall, patchApiCall, postApiCall, } from '../api';

export const GetAllAvailabilities = createAsyncThunk<{ success: true; data: { id: string; name: string }[] } | ErrorResponse>('GetAllAvailabilities', () => getApiCall<{ success: true; data: { id: string; name: string }[] }>('/get-all-availabilities'));
export const GetAllWorkRights = createAsyncThunk<{ success: true; data: { id: string; name: string }[] } | ErrorResponse>('GetAllWorkRights', () => getApiCall<{ success: true; data: { id: string; name: string }[] }>('/get-all-work-rights'));
export const GetBookmarkJobs = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse>('GetBookmarkJobs', () => getApiCall<{ success: true, data: RoleItem[] }>('/jobseekers/my-favourite-jobs'));
export const GetJobByStatus = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { status: string }>('GetSuggestedJobs', ({ status }) => getApiCall<{ success: true, data: RoleItem[] }>('/company/posted-jobs/' + status));
export const deleteJob = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { status: string }>('GetSuggestedJobs', (body) => postApiCall<{ success: true, data: RoleItem[] }>('/company/delete-RoleItem', body));
export const UploadCV = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, {}>('UploadCV', (body) => postApiCall<{ success: true, data: RoleItem[] }>('/jobseekers/cv-save', body, { as: "form" }));
export const UploadDocument = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, {}>('UploadDocument', (body) => postApiCall<{ success: true, data: RoleItem[] }>('/company/messages/upload-file', body, { as: "form" }));
export const GetJobApplication = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { search: string, page: number }>('GetJobApplication', ({ search, page }) => getApiCall<{ success: true, data: RoleItem[] }>('/jobseekers/my-RoleItem-applications?search=' + search + '&page=' + page));
export const GetCv = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { id: number }>('GetCv', ({ id }) => getApiCall<{ success: true, data: RoleItem[] }>('/jobseekers/get-cvs?userid=' + id));
export const GetNotification = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse>('GetNotification', () => getApiCall<{ success: true, data: RoleItem[] }>('/jobseekers/get-notifications'));
export const DeleteNotification = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse>('DeleteNotification', ({ id }) => deleteApiCall<{ success: true, data: RoleItem[] }>('/jobseekers/delete-notificatoin/' + id,));
export const ApplyJobs = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, {}>('ApplyJobs', (body) => postApiCall<{ success: true, data: RoleItem[] }>('/jobs/apply', body));
export const GetUserLanguages = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse>('GetUserLanguages', () => getApiCall<{ success: true, data: RoleItem[] }>('/jobseeker/languages'));
export const PostUserLanguages = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, {}>('PostUserLanguages', (data) => postApiCall<{ success: true, data: RoleItem[] }>('/jobseeker/languages', data));
export const GetExperience = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse>('GetExperience', () => getApiCall<{ success: true, data: RoleItem[] }>('/jobseeker/experiences'));
export const DeleteCv = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { id: number, cvid: number }>('DeleteCv', ({ id, cvid }) => deleteApiCall<{ success: true, data: RoleItem[] }>(`/jobseekers/cv-delete?cvid=${cvid}&userid=${id}`));
export const DeleteExperience = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { id: number, }>('DeleteExperience', ({ id }) => deleteApiCall<{ success: true, data: RoleItem[] }>(`/jobseeker/experiences/${id}`));
export const DeleteProject = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { id: number, }>('DeleteProject', ({ id }) => deleteApiCall<{ success: true, data: RoleItem[] }>(`/jobseeker/projects/${id}`));
export const DeleteEducation = createAsyncThunk<{ success: true, data: RoleItem[] } | ErrorResponse, { id: number, }>('DeleteEducation', ({ id }) => deleteApiCall<{ success: true, data: RoleItem[] }>(`/jobseeker/educations/${id}`));
export const GetJobs = createAsyncThunk<{ success: true, data: { jobs: RoleItem[] } } | ErrorResponse, { page: number, search?: string, job_typeid: number[], job_skillid: number[], companyid: number[], job_title: string[], job_experienceid: number[], degree_levelid: number[], job_shiftid: number[], genderid: number[], career_levelid: number[], functional_areaid: number[], cityid: number[], salary_from: number, salary_to: number }>('GetJobs', ({ page, ...body }) => postApiCall<{ success: true, data: { jobs: RoleItem[] } }>('/jobseekers/search-jobs?page=' + page, body));
export const DeleteRecruter = createAsyncThunk<
  { success: true, data: { jobs: RoleItem[] } } | ErrorResponse, { search?: string, job_typeid: number[], job_skillid: number[], companyid: number[], job_title: string[], job_experienceid: number[], degree_levelid: number[], job_shiftid: number[], genderid: number[], career_levelid: number[], functional_areaid: number[], cityid: number[], salary_from: number, salary_to: number }
>(
  'DeleteRecruter',
  ({ ...body }) => {
    return postApiCall<{ success: true, data: { jobs: RoleItem[] } }>('/company/delete-profile', body);
  }
);
export const DeleteSesdkfjds = createAsyncThunk<
  { success: true, data: { jobs: RoleItem[] } } | ErrorResponse, { search?: string, job_typeid: number[], job_skillid: number[], companyid: number[], job_title: string[], job_experienceid: number[], degree_levelid: number[], job_shiftid: number[], genderid: number[], career_levelid: number[], functional_areaid: number[], cityid: number[], salary_from: number, salary_to: number }
>(
  'DeleteSesdkfjds',
  ({ ...body }) => {
    return postApiCall<{ success: true, data: { jobs: RoleItem[] } }>('/jobseeker/delete-profile', body);
  }
);
export const GetCompanies = createAsyncThunk<
  { success: true, data: { companies: Company[] } } | ErrorResponse, { pages?: number, search?: string }
>(
  'GetCompanies',
  ({ pages, search }) => {
    return getApiCall<{ success: true, data: { companies: Company[] } }>('/jobseekers/company-list?page=' + (pages || 1) + (search ? '&search=' + encodeURIComponent(search) : ''));
  }
);
export const GetFavoriteCompanies = createAsyncThunk<
  { success: true, data: { companies: Company[] } } | ErrorResponse, { pages?: number, search?: string }
>(
  'GetFavoriteCompanies',
  ({ pages, search }) => {
    return getApiCall<{ success: true, data: { companies: Company[] } }>('/jobseekers/my-favourite-companies?page=' + (pages || 1) + (search ? '&search=' + encodeURIComponent(search) : ''));
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
export const GetContactDetails = createAsyncThunk<
  { success: true, data: { phone: string; email: string; address: string } } | ErrorResponse, void
>(
  'GetContactDetails',
  () => {
    return getApiCall<{ success: true, data: { phone: string; email: string; address: string } }>('/contact-us-details');
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
    return postApiCall<{ success: true, data: Company }>('/jobseekers/add-to-favourite-RoleItem/' + id, {});
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
export const GetJob = createAsyncThunk<{ success: true, data: { jobDetail: Job } } | ErrorResponse, { id: string | number }>('GetJob', ({ id }) => {
  return getApiCall<{ success: true, data: { jobDetail: Job } }>('/jobseekers/job/' + id);
}
);
export const ReportJob = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : RoleItem
    }
  } | ErrorResponse, { your_email: string, your_name: string, job_url: string }
>(
  'ReportJob',
  (body) => {
    return postApiCall<{
      success: true, data: {
        jobDetail
        : RoleItem
      }
    }>('/report-abuses-RoleItem', body);
  }
);
export const ReportCompany = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : RoleItem
    }
  } | ErrorResponse, { your_email: string, your_name: string, company_url: string }
>(
  'ReportCompany',
  (body) => {
    return postApiCall<{
      success: true, data: {
        jobDetail
        : RoleItem
      }
    }>('/report-abuses-company', body);
  }
);
export const DeleteBlog = createAsyncThunk<
  {
    success: true, data: {
      jobDetail
      : RoleItem
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
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/jobseekers/RoleItem-filters');
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
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/company/messages?seekerid=' + id + '&page=' + pages);
  }
);
export const GetMessageSeeker = createAsyncThunk<
  { success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } } | ErrorResponse, { search?: string }
>(
  'GetFilter',
  ({ id }) => {
    return getApiCall<{ success: true, data: { filter: { filter: string, option: string[] | { id: number, name: string }[] }[] } }>('/jobseeker/messages?companyid=' + id);
  }
);
export const ProfileData = createAsyncThunk<
  { success: true, data: { login_step: number, user: User } } | ErrorResponse
>(
  'ProfileData',
  () => {
    return getApiCall<{ success: true, data: { user: User } }>('/auth/jobseekers/me');
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
    return getApiCall<{ success: true, data: User }>('/get-RoleItem-experiences');
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
    return getApiCall<{ success: true, data: User }>('/get-RoleItem-types');
  }
);
export const JobShifts = createAsyncThunk<
  { success: true, data: User } | ErrorResponse
>(
  'JobShifts',
  () => {
    return getApiCall<{ success: true, data: User }>('/get-RoleItem-shifts');
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
    return getApiCall<{ success: true, data: User }>('/get-states?countryid=' + id);
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
    return getApiCall<{ success: true, data: User }>('/get-cities?stateid=' + id);
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
    return postApiCall<{ success: true, data: User }>('/company/post-new-RoleItem', body,);
  }
);
export const EditNewJob = createAsyncThunk<
  { success: true, data: User } | ErrorResponse, {}
>(
  'EditNewJob',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, data: User }>(`/company/update-RoleItem/${id}`, body,);
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
    return getApiCall<{ success: true, data: User }>('/get-degree-types?degree_levelid=' + id);
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
  { success: true, jobs: RoleItem[] } | ErrorResponse, { id: string, isLiked: boolean }
>(
  'LikeJob',
  ({ id, isLiked }) => {
    return patchApiCall<{ success: true, jobs: RoleItem[], }>('RoleItem/' + id + "/like", { isLiked });
  }
);
export const BookmarkJob = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, { id: string, isBookmarked: boolean }
>(
  'LikeJob',
  ({ id, isBookmarked }) => {
    return patchApiCall<{ success: true, jobs: RoleItem[], }>('RoleItem/' + id + "/bookmark", { isBookmarked });
  }
);
export const RejobJob = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, { id: string, isRejobed: boolean }
>(
  'LikeJob',
  ({ id, isRejobed }) => {
    return patchApiCall<{ success: true, jobs: RoleItem[], }>('RoleItem/' + id + "/rejob", { isRejobed });
  }
);
export const AddWorkExperience = createAsyncThunk<
  { success: true, data: RoleItem } | ErrorResponse, {}
>(
  'AddWorkExperience',
  (body) => {
    return postApiCall<{ success: true, data: RoleItem, }>('/jobseeker/experiences', body);
  }
);
export const AddProject = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, {}
>(
  'AddProject',
  (body) => {
    return postApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/projects', body, { as: "form" });
  }
);
export const UpdateProfile = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, {}
>(
  'UpdateProfile',
  (body) => {
    return postApiCall<{ success: true, jobs: RoleItem[], }>('/jobseekers/update/image', body, { as: "form" });
  }
);
export const GetProject = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse
>(
  'GetProject',
  () => {
    return getApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/projects');
  }
);
export const GetSkills = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse
>(
  'GetSkills',
  () => {
    return getApiCall<{ success: true, jobs: RoleItem[], }>('/get-all-job-skills');
  }
);
export const AddSkill = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, {}
>(
  'AddSkill',
  (body) => {
    return postApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/skills', body);
  }
);
export const EditSkill = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, {}
>(
  'EditSkill',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/skills/' + id, body);
  }
);
export const EditLanguage = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, {}
>(
  'EditSkill',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/languages/' + id, body);
  }
);
export const GetUserSkill = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse
>(
  'GetUserSkill',
  () => {
    return getApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/skills');
  }
);
export const DeleteUserSkill = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, { id: string }
>(
  'DeleteUserSkill',
  ({ id }) => {
    return deleteApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/skills/' + id);
  }
);
export const DeleteUserLanguage = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse, { id: string }
>(
  'DeleteUserLanguage',
  ({ id }) => {
    return deleteApiCall<{ success: true, jobs: RoleItem[], }>('/jobseeker/languages/' + id);
  }
);
export const GetLanguages = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse
>(
  'GetLanguages',
  () => {
    return getApiCall<{ success: true, jobs: RoleItem[], }>('/get-all-languages');
  }
);
export const GetLanguagesLevel = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse
>(
  'GetLanguagesLevel',
  () => {
    return getApiCall<{ success: true, jobs: RoleItem[], }>('/get-all-language-lavels');
  }
);
export const GetExperienceLevels = createAsyncThunk<
  { success: true, jobs: RoleItem[] } | ErrorResponse
>(
  'GetExperienceLevels',
  () => {
    return getApiCall<{ success: true, jobs: RoleItem[], }>('/get-all-RoleItem-experinces');
  }
);
export const EditWorkExperience = createAsyncThunk<
  { success: true, data: RoleItem } | ErrorResponse, { id: number, [key: string]: any }
>(
  'AddWorkExperience',
  ({ id, ...body }) => {
    return postApiCall<{ success: true, data: RoleItem, }>('/jobseeker/experiences/' + id, body);
  }
);
export const GetBanners = createAsyncThunk<
  { success: true, data: any[] } | ErrorResponse
>(
  'GetBanners',
  () => {
    return getApiCall<{ success: true, data: any[] }>('/banners');
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
  appliedJobIds: [],
  bookmarkedJobIds: {} as Record<number, boolean>,
  banners: []
};
export const DeleteCertificate = createAsyncThunk<
  { success: true, data: any } | ErrorResponse, { id: string }
>(
  'DeleteCertificate',
  ({ id }) => {
    return deleteApiCall<{ success: true, data: any }>('/jobseeker/delete-certificate/' + id);
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // likeReducers: (state, { payload }) => {
    //   if (state.jobs.jobObject[payload.id].isLiked) {
    //     state.jobs.jobObject[payload.id].isLiked = false
    //     state.jobs.jobObject[payload.id].likesCount = state.jobs.jobObject[payload.id].likesCount - 1
    //   }
    //   else {
    //     state.jobs.jobObject[payload.id].isLiked = true
    //     state.jobs.jobObject[payload.id].likesCount = state.jobs.jobObject[payload.id].likesCount ? state.jobs.jobObject[payload.id].likesCount + 1 : 1
    //   }
    // },
    // bookmarkReducers: (state, { payload }) => {
    //   if (state.jobs.jobObject[payload.id].isBookmarked) {
    //     state.jobs.jobObject[payload.id].isBookmarked = false
    //     state.jobs.jobObject[payload.id].bookmarksCount = state.jobs.jobObject[payload.id].bookmarksCount - 1
    //   }
    //   else {
    //     state.jobs.jobObject[payload.id].isBookmarked = true
    //     state.jobs.jobObject[payload.id].bookmarksCount = state.jobs.jobObject[payload.id].bookmarksCount ? state.jobs.jobObject[payload.id].bookmarksCount + 1 : 1
    //   }
    // },
    // rejobReducers: (state, { payload }) => {
    //   if (state.jobs.jobObject[payload.id].isRejobed) {
    //     state.jobs.jobObject[payload.id].isRejobed = false
    //     state.jobs.jobObject[payload.id].rejobCount = state.jobs.jobObject[payload.id].rejobCount - 1
    //   }
    //   else {
    //     state.jobs.jobObject[payload.id].isRejobed = true
    //     state.jobs.jobObject[payload.id].rejobCount = state.jobs.jobObject[payload.id].rejobCount ? state.jobs.jobObject[payload.id].rejobCount + 1 : 1
    //   }
    // },
    setAppliedJobId: (state, { payload }) => {
      if (!state.appliedJobIds.includes(payload)) {
        state.appliedJobIds.push(payload);
      }
    },
    toggleBookmark: (state, { payload }: { payload: { id: number, is_favorited: boolean } }) => {
      state.bookmarkedJobIds[payload.id] = !payload.is_favorited;
    },
  },
  extraReducers(builder) {
    builder


      .addCase(GetBanners.fulfilled, (state, { payload }) => {
        if (payload.success) {
          state.banners = payload.data
        }
      })
  }
});



export const { setAppliedJobId, toggleBookmark } = jobSlice.actions;
export default jobSlice.reducer;
