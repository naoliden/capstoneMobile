import {
  MODAL_COURSE,
  MODAL_TUTOR,
  COURSE_REVIEWS,
} from '../actions/types';

const initialState = {
  visibleModalTutor: false,
  visibleModalCourse: false,
  courseReviews: {},
};

const reviews = (state = initialState, action = { type: 'MODAL_TUTOR', payload: false }) => {
  switch (action.type) {
    case MODAL_TUTOR:
      return { ...state, visibleModalTutor: action.payload };

    case MODAL_COURSE:
      return { ...state, visibleModalCourse: action.payload };

    case COURSE_REVIEWS:
      return { ...state, courseReviews: action.payload };

    default:
      return state;
  }
};

export default reviews;
