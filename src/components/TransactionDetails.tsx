import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet, ScrollView, View, Text,
} from 'react-native';
import { Spinner } from 'native-base';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import {
  BLUE, GRAY, LIGHT_GRAY, BLACK,
} from '../config/colors';

const styles = StyleSheet.create({
  bodyContent: {
    padding: 10,
    paddingLeft: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  money: {
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-end',
    textAlign: 'right',
    paddingRight: 10,
  },
  subtitle: {
    color: BLACK,
    fontSize: 18,
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    width: '100%',
  },
});

const GET_TRANSACTION_BY_ID = gql`
query ($transactionId: Int!) {
  transactionsFilterBy(input: { id: $transactionId }) {
    id
    money
    currencyCode
    createdAt
    reservationsInfo {
      reservation {
        id
        tutorAvailability {
          id
          date
          hour
        }
      }
    }
  }
}
`;

const TransactionDetails = (props) => {
  const {
    paymentMethod,
    moneyToLiblu,
    moneyToTutor,
    transactionId,
    date,
    hour,
    name,
    price,
    currency,
    firstName,
    lastName,
  } = props;
  if (paymentMethod === 'PAYPAL') {
    return (
      <Query
        query={GET_TRANSACTION_BY_ID}
        variables={{ transactionId: parseInt(transactionId, 10) }}
      >
        {({ loading, error, data }) => {
          if ((loading)) return (<Spinner color={BLUE} />);
          if (error) return (<Text>Error! {error.message}</Text>);
          if (data.transactionsFilterBy) {
            const {
              createdAt,
              reservationsInfo,
            } = data.transactionsFilterBy[0];
            const splitDate = createdAt.split('T');
            const paypalDate = splitDate[0];
            const paypalHour = splitDate[1].split('.')[0];
            return (
              <ScrollView>
                <View style={styles.bodyContent}>
                  <Text style={styles.subtitle}>{i18n.t('transactionDetails.reservation')}</Text>
                  <Text style={styles.description}>{i18n.t('transactionDetails.course')}: {name}</Text>
                  <Text style={styles.description}>{i18n.t('transactionDetails.classDate')}: {date} {hour}</Text>
                  <Text style={styles.description}>{i18n.t('transactionDetails.studentName')}: {firstName} {lastName}</Text>
                </View>
                <View style={styles.bodyContent}>
                  <Text style={styles.subtitle}>{i18n.t('transactionDetails.paypal')}</Text>
                  <Text style={styles.description}>{i18n.t('transactionDetails.paypalDate')}: {paypalDate} {paypalHour}</Text>

                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.description}>{i18n.t('transactionDetails.total')}:</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.money}>{currency} ${price}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.description}>{i18n.t('transactionDetails.moneyToTutor')}:</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.money}>{currency} ${moneyToTutor}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.description}>{i18n.t('transactionDetails.moneyToLiblu')}:</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.money}>{currency} ${moneyToLiblu}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.bodyContent}>
                  <Text style={styles.subtitle}>{i18n.t('transactionDetails.otherReservations')}:</Text>
                  {reservationsInfo.map((reservation: object) => {
                    const { tutorAvailability } = reservation.reservation;
                    const { date: resDate, hour: resHour } = tutorAvailability;
                    return (
                      <Text style={styles.description}>{resDate} {resHour}</Text>
                    );
                  })}
                </View>
              </ScrollView>
            );
          }
          return <View />;
        }}
      </Query>
    );
  }
  return (
    <ScrollView>
      <View style={styles.bodyContent}>
        <Text style={styles.subtitle}>{i18n.t('transactionDetails.reservation')}</Text>
        <Text style={styles.description}>{i18n.t('transactionDetails.course')}: {name}</Text>
        <Text style={styles.description}>{i18n.t('transactionDetails.classDate')}: {date} {hour}</Text>
        <Text style={styles.description}>{i18n.t('transactionDetails.studentName')}: {firstName} {lastName}</Text>
      </View>
      <View style={styles.bodyContent}>
        <Text style={styles.subtitle}>{i18n.t('transactionDetails.cash')}</Text>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.description}>{i18n.t('transactionDetails.total')}:</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.money}>{currency} ${price}</Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.description}>{i18n.t('transactionDetails.moneyToTutor')}:</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.money}>{currency} ${moneyToTutor}</Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.description}>{i18n.t('transactionDetails.moneyToLiblu')}:</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.money}>{currency} ${moneyToLiblu}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

TransactionDetails.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  moneyToLiblu: PropTypes.number.isRequired,
  moneyToTutor: PropTypes.number.isRequired,
  transactionId: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  hour: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
};

const mapStateToProps = (state: object) => {
  const { currentTransaction } = state.transactions;
  return currentTransaction;
};

export default connect(mapStateToProps)(TransactionDetails);
