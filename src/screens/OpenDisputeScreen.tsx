import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18n-js';
import OpenDispute from '../components/OpenDispute';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const OpenDisputeScreen = () => (
  <View style={styles.container}>
    <OpenDispute />
  </View>
);

OpenDisputeScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('dispute.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default OpenDisputeScreen;
