import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Notifications from '../components/Notifications';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const NotificationsScreen = (props) => {
  const { id } = props;
  return (
    <View style={styles.container}>
      <Notifications id={id} />
    </View>
  );
};

NotificationsScreen.navigationOptions = {
  // title: i18n.t('notifications.title'),
  title: 'Notifications',
};

NotificationsScreen.propTypes = {
  id: PropTypes.number.isRequired,
};

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { id } = user;
  return { id };
};

export default connect(mapStateToProps, null)(NotificationsScreen);
