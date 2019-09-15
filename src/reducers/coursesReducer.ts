import {
  SHOW_COURSE,
  SHOW_TUTOR,
  SAVE_COURSES,
  SAVE_ALL_COURSES,
  SAVE_TUTORS,
  SAVE_ALL_TUTORS,
} from '../actions/types';

const initialState = {
  course: 1,
  tutor: 1,
  courses: [],
  allCourses: [],
  tutors: [],
  allTutors: [],
};

export default (state = initialState, action = { type: 'SHOW_COURSE', payload: 1 }) => {
  switch (action.type) {
    case SHOW_COURSE:
      return { ...state, course: action.payload };

    case SHOW_TUTOR:
      return { ...state, tutor: action.payload };

    case SAVE_COURSES:
      return { ...state, courses: action.payload };

    case SAVE_ALL_COURSES:
      return { ...state, allCourses: action.payload };

    case SAVE_TUTORS:
      return { ...state, tutors: action.payload };

    case SAVE_ALL_TUTORS:
      return { ...state, allTutors: action.payload };

    default:
      return state;
  }
};
