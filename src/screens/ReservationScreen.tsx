import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import * as PropTypes from 'prop-types';
import i18n from 'i18n-js';
import Reservation from '../components/Reservation';
import BackButton from '../components/BackButton';


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const ReservationScreen = (props) => {
  const { navigation } = props;
  const reservationId = navigation.getParam('reservationId');
  return (
    <View style={styles.container}>
      <Reservation reservationId={reservationId} />
    </View>
  );
};

ReservationScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

ReservationScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('reservation.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default withNavigation(ReservationScreen);
