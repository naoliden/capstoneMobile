import {
  NOTIFICATIONS,
} from './types';

export const updateNumber = (number: number) => (
  {
    type: NOTIFICATIONS,
    payload: number,
  }
);
