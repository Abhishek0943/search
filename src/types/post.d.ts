interface RoleItem {
  id: number;
  jobTitle: string;
  businessName: string;
  startDate: string;
  endDate: string;
  stillHere: boolean;
  description: string;
}
interface Job {
  id: number;
  company_info?: {
    image: string;
    name: string;
    description: string
  };
  jobLocation: string;
  title: string;
  expiredAt: string;
  salary_currency: string;
  salary: string;
  is_hide_salary: boolean;
  jobType: string;
  salary_period: string;
  functionalArea: string;
  job_description: {
    title: string,
    data: string
  }[]
}
interface Company {
  id: number,
  description: string,
  jobs: job[]
  name: string;
  city?: string;
  country?: string;
  email: string;
  phone: string;
  logo: string;
  slug: string;

}


type UploadBody = {
  description?: string;
  media?: Asset[];           // RN ImagePicker assets
  url?: string;              // if you still send it; ok to omit if server builds URLs
  options?: string[];
  jobType: "link" | "media" | "poll" | ""
};

interface JobInitialState {
  jobs: {
    jobObject: Record<string, Job>,
    jobIds: string[],
  }
  users: {
    userObject: Record<string, Job>,
    userIds: string[],
  }
  suggested: any[]
  recent: any[]
  appliedJobIds: any[]
  banners: any[]
}