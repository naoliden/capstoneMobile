import {
  WRITE,
  SWITCH,
  PLACEHOLDER,
} from '../actions/types';

const INITIAL_STATE = {
  text: '',
  switchValue: false,
  placeholderText: '',
};

const searchBar = (state = INITIAL_STATE, action = { type: 'WRITE', payload: '' }) => {
  switch (action.type) {
    case WRITE:
      return { ...state, text: action.payload };
    case SWITCH:
      return { ...state, switchValue: action.payload };
    case PLACEHOLDER:
      return { ...state, placeholderText: action.payload };
    default:
      return state;
  }
};

export default searchBar;
