import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { routes } from '../constants/values';
import { AddJob, Apply, ApplyJob, Candidate, Chat, Company, CompanyDetails, CV, Education, ForgotPassword, Home, Jobdetail, Language, LanguageForm, Login, Notification, PersonalInfo, Profile, Project, ProjectForm, RecentJob, RecruiterHome, Search, Setting, Signup, Skill, SkillAdd, Splash, SuggestedJob, Welcome, WelcomeTwo, WorkExperience, WorkExperienceForm } from '../pages';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EducationForm from '../pages/PersonalInfo/EducationForm';
import CVAdd from '../pages/PersonalInfo/CVAdd';

const Stack = createNativeStackNavigator();
const Routes = () => {
  const { isAuth, user } = useAppSelector(state => state.userStore);
  const [role, setRole] = useState<"seeker" | "recruiter">()
  useEffect(() => {
    const set = async () => {
      const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
      setRole(a)
    }
    set()
  }, [])
  return (
    <NavigationContainer >
      <Stack.Navigator>
        {
          !isAuth && <>
            <Stack.Screen name={routes.SPLASH} component={Splash} options={{ headerShown: false }} />
            <Stack.Screen name={routes.WELCOME} component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name={routes.WELCOMETWO} component={WelcomeTwo} options={{ headerShown: false }} />
            <Stack.Screen name={routes.LOGIN} component={Login} options={{ headerShown: false }} />
            <Stack.Screen name={routes.SIGNUP} component={Signup} options={{ headerShown: false }} />
            <Stack.Screen name={routes.FORGOTPASSWORD} component={ForgotPassword} options={{ headerShown: false }} />
          </>
        }

        {
          role === "recruiter" ? <>
              <Stack.Screen name={routes.HOME} component={RecruiterHome} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.ACTIVECANDIDATE} component={Candidate} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.ADDJOB} component={AddJob} options={{ headerShown: false, animation: 'none' }} />
              {/* <Stack.Screen name={routes.CHAT} component={Chat} options={{ headerShown: false, animation: 'none' }} /> */}

          </> :
            <>
              <Stack.Screen name={routes.HOME} component={Home} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.CHAT} component={Chat} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.SEARCH} component={Search} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.JOBDETAIL} component={Jobdetail} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.COMPANY} component={Company} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.COMPANYDETAILS} component={CompanyDetails} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.SUGGESTEDJOB} component={SuggestedJob} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.PROFILE} component={Profile} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.PERSONALINFO} component={PersonalInfo} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.WORKEXPERIENCE} component={WorkExperience} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.WORKEXPERIENCEFORM} component={WorkExperienceForm} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.EDUCATION} component={Education} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.EDUCATIONFORM} component={EducationForm} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.CV} component={CV} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.CVADD} component={CVAdd} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.RECENTJOB} component={RecentJob} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.APPLYJOB} component={ApplyJob} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.PROJECT} component={Project} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.PROJECTFORM} component={ProjectForm} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.SKILL} component={Skill} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.SKILLFORM} component={SkillAdd} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.LANGUAGE} component={Language} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.LANGUAGEFORM} component={LanguageForm} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.APPLY} component={Apply} options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name={routes.NOTIFICATION} component={Notification} options={{ headerShown: false, animation: 'none' }} />
            </>
        }

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
