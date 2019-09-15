import * as React from 'react';
import {
  StyleSheet, View, TouchableHighlight,
} from 'react-native';
import * as PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { BLUE, WHITE } from '../config/colors';

const styles = StyleSheet.create({
  bigContainer: {
    marginLeft: 10,
  },
  container: {
    flex: 1,
    backgroundColor: BLUE,
    width: 40,
    height: 40,
    maxHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const HeaderNewCourseButton = (props) => {
  const { navigation } = props;
  return (
    <View style={styles.bigContainer}>
      <TouchableHighlight style={styles.container} onPress={() => navigation.navigate('CreateCourse')}>
        <Ionicons name="ios-add-circle-outline" size={30} color={WHITE} />
      </TouchableHighlight>
    </View>
  );
};

HeaderNewCourseButton.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default HeaderNewCourseButton;
