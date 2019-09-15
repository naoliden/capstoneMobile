import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import { GRAY, LIGHT_GRAY } from '../config/colors';
import { parseDate } from './ProfileUtils';


const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    alignSelf: 'flex-start',
    width: '80%',
    height: 80,
  },
  entryWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width,
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
    alignSelf: 'flex-start',
    width: 50,
    marginLeft: -30,
    flex: 1,
  },
  title: {
    fontSize: 17,
    color: GRAY,
    fontWeight: '500',
    width: '90%',
    marginTop: 1,
  },
  message: {
    fontSize: 14,
    color: LIGHT_GRAY,
    width: '90%',
    marginTop: 3,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    width: '100%',
  },
});

function getIcon(type) {
  let icon;
  if (type === 'classReservation') {
    icon = 'calendar-clock';
  } else if (type === 'cancelledReservation') {
    icon = 'calendar-remove';
  } else if (type === 'classDoneTutor') {
    icon = 'alarm-check';
  } else if (type === 'classDoneUser') {
    icon = 'alarm-check';
  } else if (type === 'tutorRequestAccepted') {
    icon = 'account-check';
  } else {
    icon = 'account-remove';
  }
  return icon;
}

function getHour(hour: number) {
  if (hour === 3) {
    return 23;
  } if (hour === 0) {
    return 20;
  } if (hour === 1) {
    return 21;
  } if (hour === 2) {
    return 22;
  }
  return hour - 4;
}

function parseTime(time: string) {
  const splitDate = time.split('T');
  const date = splitDate[0];
  const newDate = parseDate(date);
  const hour = splitDate[1].split('.')[0];
  const splittedHour = hour.split(':');
  const thisHour = getHour(parseInt(splittedHour[0], 10));
  const newHour = String(thisHour).concat(':').concat(splittedHour[1]);
  return newHour.concat(' ').concat(newDate);
}

export class NotificationsListItem extends React.Component {
  public static propTypes = {
    type: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    reservationId: PropTypes.number,
    refetch: PropTypes.func,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    dispatchChangeMode: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
  }

  public static defaultProps = {
    reservationId: null,
    refetch: null,
  }

  private handleOnPress() {
    const {
      reservationId, refetch, navigation, dispatchChangeMode, type,
    } = this.props;
    if (type === 'classReservation' || type === 'classDoneTutor' || type === 'cancelledReservation') {
      dispatchChangeMode(true);
      navigation.navigate('Reservation', {
        reservationId,
        refetch,
      });
    } else if (type === 'tutorRequestAccepted') {
      dispatchChangeMode(true);
      navigation.navigate('TutorResponse', {
        type,
      });
    } else if (type === 'tutorRequestRejected') {
      dispatchChangeMode(false);
      navigation.navigate('TutorResponse', {
        type,
      });
    } else if (type === 'classDoneUser') {
      dispatchChangeMode(false);
      navigation.navigate('Reservation', {
        reservationId,
        refetch,
      });
    }
  }

  public render() {
    const {
      type, date,
      backgroundColor, message,
    } = this.props;

    const parsedDate = parseTime(date);
    const icon = getIcon(type);

    return (
      <View>
        <TouchableOpacity
          underlayColor={LIGHT_GRAY}
          style={{ backgroundColor }}
          onPress={() => this.handleOnPress()}
        >
          <View style={styles.entryWrapper}>
            <View>
              <MaterialCommunityIcons
                name={icon}
                size={80}
                color={GRAY}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.message}>{parsedDate}</Text>
              <Text numberOfLines={3} style={styles.title}>{message}</Text>
            </View>
            <View style={{ width: '10%', marginTop: 30 }}>
              <Entypo
                name="chevron-thin-right"
                size={20}
                color={LIGHT_GRAY}
              />
            </View>
          </View>
        </TouchableOpacity>
        <Divider style={styles.divider} />
      </View>
    );
  }
}

export default NotificationsListItem;
