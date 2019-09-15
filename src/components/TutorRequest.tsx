import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet, ScrollView, View, Text,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-elements';
import i18n from 'i18n-js';
import {
  BLUE, GRAY, BLACK,
} from '../config/colors';

const styles = StyleSheet.create({
  bodyContent: {
    padding: 10,
    paddingLeft: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'center',
    textAlign: 'center',
  },
  subtitle: {
    color: BLACK,
    fontSize: 18,
    alignSelf: 'center',
    paddingVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
});


const TutorRequest = (props) => {
  const { navigation } = props;
  const response = navigation.getParam('type');
  if (response === 'tutorRequestAccepted') {
    return (
      <ScrollView>
        <View style={styles.bodyContent}>
          <Text style={styles.subtitle}>{i18n.t('tutorAccepted.title')}</Text>
          <Text style={styles.description}>{i18n.t('tutorAccepted.congratulations')}</Text>
          <Text style={styles.description}>{i18n.t('tutorAccepted.advantages')}</Text>
          <Text style={styles.description}>{i18n.t('tutorAccepted.firstClass')}</Text>
          <Button
            buttonStyle={styles.button}
            onPress={() => navigation.navigate('CreateCourse')}
            title={i18n.t('tutorAccepted.create')}
          />
        </View>
      </ScrollView>
    );
  }
  return (
    <ScrollView>
      <View style={styles.bodyContent}>
        <Text style={styles.subtitle}>{i18n.t('tutorRejected.title')}</Text>
        <Text style={styles.description}>{i18n.t('tutorRejected.sorry')}</Text>
        <Text style={styles.description}>{i18n.t('tutorRejected.community')}</Text>
        <Text style={styles.description}>{i18n.t('tutorRejected.applyAgain')}</Text>
      </View>
    </ScrollView>
  );
};

TutorRequest.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
  }).isRequired,
};

export default withNavigation(TutorRequest);
