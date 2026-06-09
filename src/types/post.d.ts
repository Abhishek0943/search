interface Job {
  id: number,
  company_info: {
    name: string;
    image: string;
    description?: string;
  }
  title: string;
  job_description?:{title:string, data:string|{skill:string}[]}[]
  salary_period?: string;
  salary_currency?: string;
  salary?: string;
  is_applied: boolean;
  is_favorited: boolean;
  jobType: string;
  jobLocation: string;
  functionalArea?: string;
  expired?: boolean;
  jobUrl?: string;
}
interface Company {
  id: number,
  description: string,
  jobs:job[]
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
  suggested:any[]
  recent:any[]
  appliedJobIds: any[]
  banners: any[]
}