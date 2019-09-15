import {
  SET_LOGGED_IN_STATE,
  SET_USER,
  CHANGE_MODE,
  CHANGE_USER_PHOTO,
} from './types';

const setLoggedInState = (loggedInState: boolean) => (
  {
    type: SET_LOGGED_IN_STATE,
    loggedInState,
  }
);
const setUser = (user: { id: number; token: string }) => (
  {
    type: SET_USER,
    user,
  }
);

const changeMode = (mode: boolean) => (
  {
    type: CHANGE_MODE,
    mode,
  }
);

const changeUserPhoto = (photo: string) => (
  {
    type: CHANGE_USER_PHOTO,
    photo,
  }
);

const login = (user: { id: number; photo: string }, token: string, tutor: { id: number }) => {
  const action = (dispatch) => {
    let tutorId;
    let mode;
    if (tutor && tutor !== 'null') {
      tutorId = parseInt(tutor.id, 10);
      mode = true;
    } else {
      tutorId = null;
      mode = false;
    }
    dispatch(changeMode(mode));
    dispatch(setLoggedInState(true));
    dispatch(setUser({
      id: parseInt(user.id, 10),
      token,
      tutorId,
      photo: user.photo,
    }));
  };
  return action;
};

const logout = () => {
  const action = (dispatch) => {
    dispatch(setLoggedInState(false));
    dispatch(setUser({ id: null, token: '', tutorId: null }));
    dispatch(changeMode(false));
  };
  return action;
};

export {
  login,
  logout,
  setLoggedInState,
  setUser,
  changeMode,
  changeUserPhoto,
};
