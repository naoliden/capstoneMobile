import {
  SAVE_USER_TRANSACTIONS,
  SAVE_TUTOR_TRANSACTIONS,
  SAVE_CURRENT_TRANSACTION,
} from '../actions/types';

const initialState = {
  myUserTransactions: [],
  myTutorTransactions: [],
  currentTransaction: {},
};

export default (state = initialState, action = { type: SAVE_USER_TRANSACTIONS, payload: [] }) => {
  switch (action.type) {
    case SAVE_USER_TRANSACTIONS:
      return { ...state, myUserTransactions: action.payload };
    case SAVE_TUTOR_TRANSACTIONS:
      return { ...state, myTutorTransactions: action.payload };
    case SAVE_CURRENT_TRANSACTION:
      return { ...state, currentTransaction: action.payload };
    default:
      return state;
  }
}
