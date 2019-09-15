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

const Course = (props = {}) => {
  const {
    width,
    type,
    name,
    price,
    rating,
    images,
  } = props;
  let sourcePicture;
  if (images.length === 0) {
    sourcePicture = 'https://online-learning.harvard.edu/sites/default/files/styles/header/public/course/asset-v1_HarvardX%2BCalcAPL1x%2B2T2017%2Btype%40asset%2Bblock%40TITLE-Calculus-Applied-2120x1192-NO-SPOTLIGHT%202.png?itok=crWwjmVi';
  } else {
    sourcePicture = images[0].url;
  }
  return (
    <View style={{
      width: width / 2 - 30,
      height: width / 2 - 10,
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
        {type !== '' && <Text style={{ fontSize: 14, color: BLUE, fontWeight: '300' }}>{type}</Text>}
        <Text style={{ fontSize: 16, fontWeight: '400', color: GRAY }}>{name}</Text>
        <Text style={{ fontSize: 14, color: GRAY }}>US ${price}</Text>
        <Rating
          imageSize={10}
          readonly={false}
          startingValue={rating}
          style={{ alignSelf: 'flex-start' }}
        />
      </View>
    </View>
  );
};

Course.propTypes = {
  width: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  rating: PropTypes.number.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Course;
