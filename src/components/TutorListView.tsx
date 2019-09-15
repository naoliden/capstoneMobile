import * as React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import * as PropTypes from 'prop-types';
import { Rating } from 'react-native-elements';
import { BLUE, GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Tutor = (props = {}) => {
  const {
    width,
    firstName,
    lastName,
    specialty,
    // description,
    photo,
    rating,
  } = props;
  let sourcePicture;
  if (photo) {
    sourcePicture = photo;
  } else {
    sourcePicture = 'https://bootdey.com/img/Content/avatar/avatar2.png';
  }
  return (
    <View style={{
      width: width / 2 - 30,
      height: width / 2 - 20,
      marginRight: 20,
      marginBottom: 10,
    }}
    >
      <View style={{ flex: 1 }}>
        <Image
          style={{
            flex: 1,
            width: width / 2 - 30,
            height: width / 2 - 30,
            resizeMode: 'cover',
          }}
          source={{ uri: sourcePicture }}
        />
      </View>
      <View style={styles.container}>
        {specialty && (
          <Text style={{ fontSize: 14, color: BLUE, fontWeight: '300' }}>Specialty in {specialty}</Text>
        )}
        <Text style={{ fontSize: 16, fontWeight: '400', color: GRAY }}>{firstName} {lastName}</Text>
        <Rating
          imageSize={12}
          readonly={false}
          startingValue={rating}
          style={{ alignSelf: 'flex-start' }}
        />
      </View>
    </View>
  );
};

Tutor.propTypes = {
  width: PropTypes.number.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  specialty: PropTypes.string,
  // description: PropTypes.string.isRequired,
  photo: PropTypes.string,
  rating: PropTypes.number.isRequired,
};

Tutor.defaultProps = {
  photo: null,
  specialty: null,
};

export default Tutor;
