// store.ts

import { configureStore, combineReducers, } from '@reduxjs/toolkit';

import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import userReducer from '../reducer/userReducer'
import storyReducer from '../reducer/storyReducer'
import jobsReducer from '../reducer/jobsReducer'

const rootReducer = combineReducers({
  userStore: userReducer,
  storyStore: storyReducer,
  jobsReducer:jobsReducer
});


export const store = configureStore({
  reducer:rootReducer,
  // middleware: getDefaultMiddleware =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  //     },
  //   }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
