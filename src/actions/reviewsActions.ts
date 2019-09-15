import {
  MODAL_TUTOR,
  MODAL_COURSE,
  COURSE_REVIEWS,
} from './types';

export const changeTutorModal = (visible: boolean) => (
  {
    type: MODAL_TUTOR,
    payload: visible,
  }
);

export const changeCourseModal = (visible: boolean) => (
  {
    type: MODAL_COURSE,
    payload: visible,
  }
);

export const saveCourseReviews = (reviews: {}) => (
  {
    type: COURSE_REVIEWS,
    payload: reviews,
  }
);
