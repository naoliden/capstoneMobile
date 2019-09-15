import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableWithoutFeedback,
  TouchableHighlight,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { saveCurrentTransaction } from '../actions';
import { GREEN, RED, LIGHTER_GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginBottom: 125,
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    margin: 12,
    fontSize: 20,
  },
  divider: {
    backgroundColor: '#959799',
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 20,
  },
  item: {
    width: '50%',
    textAlign: 'right',
    marginRight: 10,
    marginLeft: 'auto',
  },
  columnContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // if you want to fill rows left to right
    marginHorizontal: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  total: {
    fontSize: 18,
  },
  price: {
    fontSize: 16,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

class TransactionList extends React.Component {
  public static propTypes = {
    networkStatus: PropTypes.number.isRequired,
    refetch: PropTypes.func.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatchSaveTransactions: PropTypes.func.isRequired,
    dispatchSaveCurrentTransaction: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    tutorMode: PropTypes.bool.isRequired,
  }

  public componentDidUpdate() {
    const { dispatchSaveTransactions, transactions } = this.props;
    dispatchSaveTransactions(transactions);
  }

  private keyExtractor = (item: object) => String(item.id);

  private handlePress(transaction) {
    const { dispatchSaveCurrentTransaction, navigation } = this.props;
    dispatchSaveCurrentTransaction(transaction);
    navigation.navigate('TransactionDetails');
  }

  private renderItem = ({ item }) => {
    const {
      paymentMethod,
      moneyToLiblu,
      moneyToTutor,
      transactionId,
      tutorAvailability,
      course,
      user,
    } = item;
    const { tutorMode } = this.props;
    const { date, hour } = tutorAvailability;
    const { name, price, currency } = course;
    const { firstName, lastName } = user;
    if (tutorMode) {
      if (paymentMethod === 'CASH') {
        return (
          <TouchableHighlight
            style={styles.card}
            underlayColor={LIGHTER_GRAY}
            onPress={() => this.handlePress({
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
            })}
          >
            <View>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 3 }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {name}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <FontAwesome name="minus" size={20} color={RED} />
                  <Text style={styles.price}>
                    {'  '}{currency} ${moneyToLiblu}
                  </Text>
                </View>
              </View>
              <Text>
                {date} {hour}
              </Text>
            </View>
          </TouchableHighlight>
        );
      }
      return (
        <TouchableHighlight
          style={styles.card}
          underlayColor={LIGHTER_GRAY}
          onPress={() => this.handlePress({
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
          })}
        >
          <View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 3 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {name}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <FontAwesome name="plus" size={20} color={GREEN} />
                <Text style={styles.price}>
                  {'  '}{currency} ${moneyToTutor}
                </Text>
              </View>
            </View>
            <Text>
              {date} {hour}
            </Text>
          </View>
        </TouchableHighlight>
      );
    }
    return (
      <TouchableWithoutFeedback>
        <View style={styles.card}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 3 }}>
              <Text style={{ fontWeight: 'bold' }}>
                {name}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <FontAwesome name="minus" size={20} color={RED} />
              <Text style={styles.price}>
                {'  '}{currency} ${price}
              </Text>
            </View>
          </View>
          <Text>
            {date} {hour}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  public render() {
    const {
      networkStatus,
      refetch,
      transactions,
    } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={transactions}
          keyExtractor={(item, index) => String(index)}
          renderItem={this.renderItem}
          refreshing={networkStatus === 4}
          onRefresh={() => refetch()}
        />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatchSaveCurrentTransaction: (transaction) => {
    dispatch(saveCurrentTransaction(transaction));
  },
});

export default withNavigation(connect(null, mapDispatchToProps)(TransactionList));
