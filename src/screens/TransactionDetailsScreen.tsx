import * as React from 'react';
import { View } from 'react-native';
import i18n from 'i18n-js';
import TransactionDetails from '../components/TransactionDetails';
import BackButton from '../components/BackButton';

const TransactionDetailsScreen = () => (
  <View>
    <TransactionDetails />
  </View>
);

TransactionDetailsScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('transactionDetails.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default TransactionDetailsScreen;
