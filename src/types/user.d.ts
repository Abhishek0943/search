
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
type Option = { id: string; name: string };
type QuestionType = 'short_text' | 'long_text' | 'number' | 'single_select' | 'multi_select' | 'yes_no';

type QuestionItem = {
    id?: string;
    question: string;
    answer_type: QuestionType;
    is_required: boolean;
    options: { label: string, scoring_role: string | null }[];
};
interface Question {
    question_id: number,
    expected_boolean: boolean | null,
    ideal_value: string,
    lane: "must_have" | "screening",
    min_value: string,
    scored: boolean,
    source_checksum: string,
    weight: string,
    roles: { [key: string]: "ideal" | "acceptable" | "not_preferred" },
    content: {
        type: "short_text" | "long_text" | "number" | "single_select" | "multi_select" | "yes_no",
        text: string,
        options: { id: string, label: string }[]
    }
}
interface User {
    id: number;
    email: string;
    name: string;
    creator_data?: CreatorData;
    portfolio_link?: string;
    login_step: number,
    messages_count: number,
    video: {
        video_url: string,
        uploaded_at: string,
        video_name: string
    } | null,
    cv: {
        cv_url: string,
        uploaded_at: string,
        cv_file: string
    } | null,
    skills: { skill_name: string, job_skill_id: string }[],
    certificates: any[],
    logo: string,
    images: any[],
    is_active: boolean;
    industry_id: number;
    description: string;


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
    plan: {
        plans: RecruiterPlanType[]
    }
}
interface StoryInitialState {

}