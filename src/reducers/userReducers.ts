import {
  SIGN_UP,
  SHOW_USER,
} from '../actions/types';

const initialState = {
  user: 1,
};

export default (state = initialState, action = { type: 'SHOW_USER', payload: 1 }) => {
  switch (action.type) {
    case SIGN_UP:
      return { ...state, user: action.payload };

    case SHOW_USER:
      return { ...state, user: action.payload };

    default:
      return state;
  }
};
