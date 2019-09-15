import {
  SIGN_UP,
  SHOW_USER,
} from './types';

export const signUp = (userInfo: {}) => (
  {
    type: SIGN_UP,
    payload: userInfo,
  }
);

export const showUser = (id: number) => (
  {
    type: SHOW_USER,
    payload: id,
  }
);
