import { combineReducers } from 'redux';
import searchBar from './searchBarReducer';
import courses from './coursesReducer';
import user from './userReducers';
import login from './loginReducer';
import reviews from './reviewsReducer';
import langs from './languageReducer';
import notifications from './notificationsReducer';
import transactions from './transactionsReducer';

const rootReducer = combineReducers({
  searchBar,
  courses,
  user,
  login,
  reviews,
  langs,
  notifications,
  transactions,
});

export default rootReducer;
