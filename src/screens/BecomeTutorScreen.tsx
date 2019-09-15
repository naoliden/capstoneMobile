import * as React from 'react';
import i18n from 'i18n-js';
import BecomeTutor from '../components/BecomeTutor';
import BackButton from '../components/BackButton';

const BecomeTutorScreen = () => (
  <BecomeTutor />
);

BecomeTutorScreen.navigationOptions = ({ navigation }) => ({
  // title: i18n.t('reservation.title'),
  title: i18n.t('becomeTutor.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default BecomeTutorScreen;
