import {
  SHOW_COURSE,
  SHOW_TUTOR,
  SAVE_COURSES,
  SAVE_ALL_COURSES,
  SAVE_TUTORS,
  SAVE_ALL_TUTORS,
} from './types';

export const showCourse = (id: number) => (
  {
    type: SHOW_COURSE,
    payload: id,
  }
);

export const showTutor = (id: number) => (
  {
    type: SHOW_TUTOR,
    payload: id,
  }
);

export const saveCourses = (courses: {}) => (
  {
    type: SAVE_COURSES,
    payload: courses,
  }
);

export const saveAllCourses = (courses: {}) => (
  {
    type: SAVE_ALL_COURSES,
    payload: courses,
  }
);

export const saveTutors = (tutors: {}) => (
  {
    type: SAVE_TUTORS,
    payload: tutors,
  }
);

export const saveAllTutors = (tutors: {}) => (
  {
    type: SAVE_ALL_TUTORS,
    payload: tutors,
  }
);
