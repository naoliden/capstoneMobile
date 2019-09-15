import {
  NOTIFICATIONS,
} from '../actions/types';

const initialState = {
  number: 0,
};

const notifications = (state = initialState, action = { type: 'NOTIFICATION', payload: 1 }) => {
  switch (action.type) {
    case NOTIFICATIONS:
      return { ...state, number: action.payload };
    default:
      return state;
  }
};

export default notifications;
