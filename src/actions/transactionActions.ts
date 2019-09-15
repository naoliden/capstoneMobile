import {
  SAVE_USER_TRANSACTIONS,
  SAVE_TUTOR_TRANSACTIONS,
  SAVE_CURRENT_TRANSACTION,
} from './types';

export const saveUserTransactions = (transactions: {}) => (
  {
    type: SAVE_USER_TRANSACTIONS,
    payload: transactions,
  }
);

export const saveTutorTransactions = (transactions: {}) => (
  {
    type: SAVE_TUTOR_TRANSACTIONS,
    payload: transactions,
  }
);

export const saveCurrentTransaction = (transaction: {}) => (
  {
    type: SAVE_CURRENT_TRANSACTION,
    payload: transaction,
  }
);
