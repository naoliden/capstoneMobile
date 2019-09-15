import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18n-js';
import AvailabilitySelection from '../components/AvailabilitySelection';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const AvailabilitySelectionScreen = () => (
  <View style={styles.container}>
    <AvailabilitySelection />
  </View>
);

AvailabilitySelectionScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('addAvailability.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default AvailabilitySelectionScreen;
