import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  GRAY,
  GREEN,
} from '../config/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  button: {
    width,
  },
  personalData: {
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-start',
    width: '80%',
    marginLeft: 10,
  },
  settingsText: {
    color: GRAY,
    fontSize: 18,
    flex: 1,
    alignSelf: 'flex-start',
    width: '80%',
  },
  iconStyle: {
    alignSelf: 'flex-end',
    width: '20%',
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  iconPersonal: {
    width: '20%',
  },
  wrapperPersonal: {
    flex: 1,
    flexDirection: 'row',
    width,
    paddingHorizontal: 25,
  },
  description: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export const PersonalDataItem = (props) => {
  const { data, iconName } = props;
  return (
    <View style={styles.wrapperPersonal}>
      <Ionicons
        name={iconName}
        size={18}
        color={GRAY}
        iconStyle={styles.iconPersonal}
      />
      <Text
        style={styles.personalData}
      >
        {data}
      </Text>
    </View>
  );
};

PersonalDataItem.propTypes = {
  data: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
};

export const MenuItem = (props) => {
  const {
    onPress,
    iconName,
    data,
    iconType,
  } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
    >
      <View style={styles.wrapper}>
        <Text
          style={styles.settingsText}
        >
          {data}
        </Text>
        {iconType === null && (
          <Ionicons
            name={iconName}
            size={23}
            color={GRAY}
            iconStyle={styles.iconStyle}
          />
        )}
        {iconType === 'MaterialCommunityIcons' && (
          <MaterialCommunityIcons
            name={iconName}
            size={23}
            color={GRAY}
            iconStyle={styles.iconStyle}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

MenuItem.propTypes = {
  data: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  iconType: PropTypes.string,
};

MenuItem.defaultProps = {
  iconType: null,
};

export function parseDate(arg) {
  const month = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  };
  const date = String(arg).split('-');
  let year = '';
  if (date[0] !== '2019') {
    year = ' '.concat(date[0]);
  }
  const newDate = date[2].concat(' ', month[parseInt(date[1], 10)], year);
  return newDate;
}

export const CourseCard = (props) => {
  const {
    onPress, item, date, reservation, user, tutor,
  } = props;
  let source = 'https://online-learning.harvard.edu/sites/default/files/styles/header/public/course/asset-v1_HarvardX%2BCalcAPL1x%2B2T2017%2Btype%40asset%2Bblock%40TITLE-Calculus-Applied-2120x1192-NO-SPOTLIGHT%202.png?itok=crWwjmVi';
  if (item.images.length !== 0) {
    source = item.images[0].url;
  }
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: '30%' }}>
            <Image
              source={{ uri: source }}
              style={{ width: 70, height: 70, flex: 1 }}
              resizeMode="cover"
            />
          </View>
          <View style={{ width: '70%' }}>
            {date !== null && (
              <Text style={{ fontWeight: '500', fontSize: 14, color: GREEN }}>
                {parseDate(date.date)}, {date.hour}
              </Text>
            )}

            <Text style={{ fontWeight: '500', fontSize: 16, color: GRAY }}>{item.name}</Text>
            { !reservation && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            { reservation && tutor && (
              <Text style={styles.description}>Pedida por {user.firstName} {user.lastName}</Text>
            )}
            { reservation && !tutor && (
              <Text style={styles.description}>Dictada por {user.firstName} {user.lastName}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

CourseCard.propTypes = {
  onPress: PropTypes.func.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  date: PropTypes.shape({
    hour: PropTypes.string,
  }),
  reservation: PropTypes.bool,
  user: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }),
  tutor: PropTypes.bool,
};

CourseCard.defaultProps = {
  date: null,
  user: null,
  reservation: null,
  tutor: null,
};
