import * as React from 'react';
import * as PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import UserTransactions from '../components/UserTransactions';
import TutorTransactions from '../components/TutorTransactions';
import BackButton from '../components/BackButton';

const TransactionHistoryScreen = (props) => {
  const { mode, navigation } = props;
  if (mode) {
    return (
      <View>
        <TutorTransactions navigation={navigation} />
      </View>
    );
  }
  return (
    <View>
      <UserTransactions />
    </View>
  );
};

TransactionHistoryScreen.propTypes = {
  mode: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

TransactionHistoryScreen.defaultProps = {
  mode: false,
};

TransactionHistoryScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('transactions.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

const mapStateToProps = (state: object) => {
  const { mode } = state.login;
  return { mode };
};

export default connect(mapStateToProps)(TransactionHistoryScreen);
