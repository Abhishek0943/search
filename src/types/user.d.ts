
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
interface User {
    id: number;
    email:string;
    name:string;


}
interface Recruiter {
    _id: string;
    step:string
    email:string;
    username:string;


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
}
interface StoryInitialState {
   
}