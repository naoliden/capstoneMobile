import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { Spinner } from 'native-base';
import i18n from 'i18n-js';
import { saveUserTransactions } from '../actions';
import { BLUE } from '../config/colors';
import TransactionList from './TransactionList';

const GET_ALL_RESERVATIONS_BY_USER_ID = gql`
query ($userId: ID!) {
  classReservations(input: { userId: $userId, classDone: true }) {
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
});

const UserTransactions = (props) => {
  const { userId, dispatchSaveTransactions } = props;
  return (
    <Query
      query={GET_ALL_RESERVATIONS_BY_USER_ID}
      variables={{ userId: parseInt(userId, 10) }}
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
                {i18n.t('transactions.emptyUser')}
              </Text>
            </ScrollView>
          );
        }
        return (
          <TransactionList
            transactions={data.classReservations}
            refetch={refetch}
            networkStatus={networkStatus}
            dispatchSaveTransactions={dispatchSaveTransactions}
            title={{ title: i18n.t('transactions.title'), __typename: 'title' }}
            tutorMode={false}
          />
        );
      }}
    </Query>
  );
};

UserTransactions.propTypes = {
  userId: PropTypes.number.isRequired,
  dispatchSaveTransactions: PropTypes.func.isRequired,
};

const mapStateToProps = (state: object) => {
  const { id } = state.login.user;
  const userId = id;
  return { userId };
};

const mapDispatchToProps = dispatch => ({
  dispatchSaveTransactions: (transactions) => {
    dispatch(saveUserTransactions(transactions));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UserTransactions);
