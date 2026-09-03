
type WelcomeScreenItem = {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
};
type CountryItem = {
    _id: string;
    name: string;
    countryCode: string;
    alr: string;
    imageUrl: string;
};
type TopicItem = {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
};

interface WelcomeScreenResponse {
    welcome: WelcomeScreenItem[];
    success: true;
}
interface GetCountriesResponse {
    countries: CountryItem[];
    success: true;
}
interface CreatorData {
    status: 'pending' | 'approved' | 'rejected' | null;
    pending_blogs: number;
    approved_blogs: number;
    rejected_blogs: number;
}

interface BlogItem {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface GetMyBlogsResponse {
    success: true;
    data: {
        blogs: BlogItem[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        }
    }
}

interface User {
    id: number;
    email: string;
    name: string;
    creator_data?: CreatorData;
    login_step: number,
    messages_count: number
}
interface Recruiter {
    _id: string;
    step: string
    email: string;
    username: string;


}
interface UserInitialState {
    user?: User;
    isAuth: boolean;
    welcomeScreen: WelcomeScreenItem[] | [];
    countries: CountryItem[] | [];
    topic: TopicItem[] | [];
}
interface RecruiterInitialState {
    recruiter?: Recruiter;
    isAuth: boolean;
    welcomeScreen: WelcomeScreenItem[] | [];
    countries: CountryItem[] | [];
    topic: TopicItem[] | [];
    plan: any[]
}
interface StoryInitialState {

}