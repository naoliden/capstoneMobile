import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { Spinner } from 'native-base';
import i18n from 'i18n-js';
// import { FontAwesome } from '@expo/vector-icons';
import { saveTutorTransactions } from '../actions';
import { BLUE } from '../config/colors';
import TransactionList from './TransactionList';

const GET_ALL_RESERVATIONS_BY_TUTOR_ID = gql`
query ($tutorId: Int!) {
  classReservations(input: { tutorId: $tutorId, classDone: true }) {
    id
    paymentMethod
    moneyToLiblu
    moneyToTutor
    transactionId
    tutorAvailability {
      id
      date
      hour
    }
    course {
      id
      name
      price
      currency
    }
    user {
      id
      firstName
      lastName
    }
  }
}
`;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    minHeight: 500,
  },
  balanceContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 15,
  },
  message: {
    marginLeft: 12,
    fontSize: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    marginBottom: 70,
    marginTop: 30,
  },
  total: {
    fontSize: 18,
  },
});

/*
function refresh(refetchBalance, refetchTransactions) {
  refetchBalance();
  refetchTransactions();
}
*/

const TutorTransactions = (props) => {
  const { tutorId, dispatchSaveTransactions } = props;
  /*
  let balance = navigation.getParam('balance', 0);
  let iconName; let
    iconColor;
  if (balance < 0) {
    balance *= -1;
    iconName = 'minus';
    iconColor = RED;
  } else {
    iconName = 'plus';
    iconColor = GREEN;
  }
  */
  return (
    <Query
      query={GET_ALL_RESERVATIONS_BY_TUTOR_ID}
      variables={{ tutorId: parseInt(tutorId, 10) }}
      notifyOnNetworkStatusChange
    >
      {({
        loading,
        error,
        data,
        refetch,
        networkStatus,
      }) => {
        if ((loading && networkStatus !== 4)) return (<Spinner color={BLUE} />);
        if (error) return (<Text>Error! {error.message}</Text>);
        if (data.classReservations && data.classReservations.length === 0) {
          return (
            <ScrollView
              style={styles.container}
              refreshControl={
                (
                  <RefreshControl
                    refreshing={networkStatus === 4}
                    onRefresh={() => refetch()}
                  />
                )
              }
            >
              <Text style={styles.name}>{i18n.t('transactions.title')}</Text>
              <Text style={styles.message}>
                {i18n.t('transactions.emptyTutor')}
              </Text>
            </ScrollView>
          );
        }
        return (
          <View>
            {/* <View style={styles.balanceContainer}>
              <FontAwesome name={iconName} color={iconColor} size={30} />
              <Text style={styles.total}>
                {' '}USD ${balance}
              </Text>
            </View> */}
            <TransactionList
              transactions={data.classReservations}
              refetch={refetch}
              networkStatus={networkStatus}
              dispatchSaveTransactions={dispatchSaveTransactions}
              title={{ title: i18n.t('transactions.title'), __typename: 'title' }}
              tutorMode
            />
          </View>
        );
      }}
    </Query>
  );
};

TutorTransactions.propTypes = {
  tutorId: PropTypes.number.isRequired,
  dispatchSaveTransactions: PropTypes.func.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state: object) => {
  const { tutorId } = state.login.user;
  return { tutorId };
};

const mapDispatchToProps = dispatch => ({
  dispatchSaveTransactions: (transactions) => {
    dispatch(saveTutorTransactions(transactions));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TutorTransactions);
