import {
  LANGUAGE,
} from './types';

export const changeLanguage = (language: string) => (
  {
    type: LANGUAGE,
    payload: language,
  }
);
