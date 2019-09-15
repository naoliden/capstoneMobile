import {
  SET_LOGGED_IN_STATE,
  SET_USER,
  CHANGE_MODE,
  CHANGE_USER_PHOTO,
} from '../actions/types';

const initialState = {
  user: {
    id: null,
    token: '',
    tutorId: null,
  },
  loggedInState: false,
  mode: false,
};

const login = (state = initialState, action: null) => {
  switch (action.type) {
    case SET_LOGGED_IN_STATE:
      return { ...state, loggedInState: action.loggedInState };
    case SET_USER:
      return { ...state, user: action.user };
    case CHANGE_MODE:
      return { ...state, mode: action.mode };
    case CHANGE_USER_PHOTO:
      return { ...state, user: { ...state.user, photo: action.photo } };
    default:
      return state;
  }
};


export default login;
/*
const login = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loggingIn: true, user: action.user };
    case LOGIN_SUCCESS:
      return { ...state, loggedIn: true, user: action.user };
    case LOGIN_FAILURE:
      return { ...state, loggingIn: false, loggedIn: false, user: action.user };
    default:
      return state;
  }
};

export default login;
*/
