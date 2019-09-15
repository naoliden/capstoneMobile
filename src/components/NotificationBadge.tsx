import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withBadge } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';

const NotificationIcon = (props) => {
  const { tintColor, number } = props;
  const BadgedIcon = withBadge(number)(Ionicons);
  if (number > 0) {
    return (
      <BadgedIcon name="ios-notifications" type="ionicon" size={25} color={tintColor} />
    );
  }
  return (
    <Ionicons name="ios-notifications" size={25} color={tintColor} />
  );
};

const mapStateToProps = (state: object) => {
  const { number } = state.notifications;
  return { number };
};

NotificationIcon.propTypes = {
  tintColor: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
};

export default connect(mapStateToProps, null)(NotificationIcon);
