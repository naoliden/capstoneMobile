import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18n-js';
import WriteReview from '../components/WriteReview';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const WriteReviewScreen = () => (
  <View style={styles.container}>
    <WriteReview />
  </View>
);

WriteReviewScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('writeReview.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default WriteReviewScreen;
