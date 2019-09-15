import {
  LANGUAGE,
} from '../actions/types';

const initialState = {
  currentLanguage: 'en',
};

const langs = (state = initialState, action = { type: 'LANGUAGE', payload: 'en' }) => {
  switch (action.type) {
    case LANGUAGE:
      return { ...state, currentLanguage: action.payload };

    default:
      return state;
  }
};

export default langs;
