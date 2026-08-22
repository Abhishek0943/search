import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store';
import { routes } from '../constants/values';
import { AddJob, Apply, ApplyJob, Browser, Candidate, CandidateProfile, BlogPage, Chat, Company, CompanyDetails, CV, Education, ForgotPassword, Home, Jobdetail, Language, LanguageForm, Login, Messages, Notification, OpenJobs, PaymentHistory, PersonalInfo, Profile, Project, ProjectForm, RecentJob, RecruiterAccount, RecruiterHome, RecruiterProfile, Search, Signup, Skill, SkillAdd, Splash, SuggestedJob, Welcome, WorkExperience, WorkExperienceForm } from '../pages';

import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EducationForm from '../pages/PersonalInfo/EducationForm';
import CVAdd from '../pages/PersonalInfo/CVAdd';
import Contact from '../pages/PersonalInfo/Contact';
import Blog from '../pages/Blog';
import { logScreen } from '../utils/analytics';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { Linking } from 'react-native';
import Welcome2 from '../pages/Welcome/Welcome2';
import CompLogin from '../pages/Auth/CompLogin';

const Stack = createNativeStackNavigator();
const Routes = () => {
  const { isAuth, user } = useAppSelector(state => state.userStore);
  const [role, setRole] = useState<"seeker" | "recruiter">()
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string | undefined>();

  useEffect(() => {
    const set = async () => {
      const a = await AsyncStorage.getItem("role") as "seeker" | "recruiter"
      setRole(a)
    }
    set()
  }, [])

  const handleNotificationNavigation = async (data: any) => {
    console.log("🚀 ~ handleNotificationNavigation ~ data:", data)
    if (!data) {
      navigationRef.current?.navigate(routes.NOTIFICATION);
    }
    else if (data?.click_action) {
      Linking.openURL(data?.click_action)
    }
    else {
      navigationRef.current?.navigate(routes.NOTIFICATION);
    }
    // const { type, redirect, job_id, application_id } = data;
    // const currentRole = await AsyncStorage.getItem("role");
    // if (job_id) {
    //   if (currentRole === "seeker") {
    //     navigationRef.current?.navigate(routes.  as never, { id: Number(job_id) } as never);
    //   } else {
    //     navigationRef.current?.navigate(routes.NOTIFICATION as never);
    //   }
    // } else if (application_id) {
    //   if (currentRole === "recruiter") {
    //     navigationRef.current?.navigate(routes.CANDIDATEPROFILE as never, { application_id: Number(application_id) } as never);
    //   } else {
    //     navigationRef.current?.navigate(routes.NOTIFICATION as never);
    //   }
    // } else if (data.click_action) {
    //   try {
    //     await Linking.openURL(data.click_action);
    //   } catch (e) {
    //     navigationRef.current?.navigate(routes.NOTIFICATION as never);
    //   }
    // } else {
    //   navigationRef.current?.navigate(routes.NOTIFICATION as never);
    // }
  };

  useEffect(() => {
    const unsubscribeFCM = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationNavigation(remoteMessage?.data);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        setTimeout(() => {
          handleNotificationNavigation(remoteMessage?.data);
        }, 1000);
      }
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleNotificationNavigation(detail.notification?.data);
      }
    });

    return () => {
      unsubscribeFCM();
      unsubscribeNotifee();
    };
  }, []);
  const linking = {
    prefixes: [
      "searchtalents.co/app",
      "https://searchtalents.co",
      "https://www.searchtalents.co",
    ],
    config: {
      screens: {
        [routes.SEARCH]: routes.SEARCH,
        [routes.CHAT]: 'my-messages',
        [routes.JOBDETAIL]: {
          path: 'job/:id',
          parse: {
            id: (id: string) => {
              const parts = id.split('-');
              return parseInt(parts[parts.length - 1], 10);
            },
          },
        },
        [routes.CANDIDATEPROFILE]: {
          path: 'applicant-profile/:application_id',
          parse: {
            application_id: Number,
          },
        },
        [routes.BLOGPAGE]: 'creator-dashboard',
        [routes.PERSONALINFO]: 'profile-incomplete',
        [routes.CV]: 'resume-upload-reminder',
      },
    },
  };
  const onReady = () => {
    routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
  };

  const onStateChange = async () => {
    const previousRoute = routeNameRef.current;
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    if (currentRoute && currentRoute !== previousRoute) {
      await logScreen(currentRoute);
    }
    routeNameRef.current = currentRoute;
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={onReady}
      onStateChange={onStateChange}
    >
      <Stack.Navigator>
        <Stack.Screen name={routes.SPLASH} component={Splash} options={{ headerShown: false }} />
        {
          !isAuth && <>
            <Stack.Screen name={routes.WELCOME} component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name={routes.WELCOME2} component={Welcome2} options={{ headerShown: false }} />
            <Stack.Screen name={routes.COMPLOGIN} component={CompLogin} options={{ headerShown: false }} />
            <Stack.Screen name={routes.LOGIN} component={Login} options={{ headerShown: false }} />
            <Stack.Screen name={routes.SIGNUP} component={Signup} options={{ headerShown: false }} />
            <Stack.Screen name={routes.FORGOTPASSWORD} component={ForgotPassword} options={{ headerShown: false }} />
          </>
        }

        <Stack.Screen name={routes.RECRUITERHOME} component={RecruiterHome} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.ACTIVECANDIDATE} component={Candidate} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.ADDJOB} component={AddJob} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.MESSAGE} component={Messages} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.BLOG} component={Blog} options={{ headerShown: false, animation: 'none' }} />

        <Stack.Screen name={routes.RECRUITERPROFILE} component={RecruiterProfile} options={{ headerShown: false, animation: 'none' }} />


        <Stack.Screen name={routes.PROFILE} component={Profile} options={{ headerShown: false, animation: 'none' }} />

        <Stack.Screen name={routes.OPENJOBS} component={OpenJobs} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.ACCOUNT} component={RecruiterAccount} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.CANDIDATEPROFILE} component={CandidateProfile} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.HOME} component={Home} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.BLOGPAGE} component={BlogPage} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.CHAT} component={Chat} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.SEARCH} component={Search} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.JOBDETAIL} component={Jobdetail} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.COMPANY} component={Company} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.COMPANYDETAILS} component={CompanyDetails} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.SUGGESTEDJOB} component={SuggestedJob} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.PAYMENTHISTORY} component={PaymentHistory} options={{ headerShown: false, animation: 'none' }} />
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
        <Stack.Screen name={routes.CONTACT} component={Contact} options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name={routes.BROWSER} component={Browser} options={{ headerShown: false }} />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
