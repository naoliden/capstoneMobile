import * as React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Text,
} from 'native-base';
import i18n from 'i18n-js';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 50,
    backgroundColor: '#ffffff',
  },
  title: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 15,
  },
  parConteiner: {
    padding: 25,
  },
  paragraph: {
    alignSelf: 'center',
    fontSize: 15,
    textAlign: 'justify',
  },
});

const PrivacyPolicyScreen = () => (
  <View style={styles.parConteiner}>
    <ScrollView>
      <Text style={styles.paragraph}>Lorem ipsum dolor sit amet,
      consectetur adipiscing elit, sed do eiusmod tempor incididunt
      ut labore et dolore magna aliqua. Ut enim ad minim veniam,
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex
      ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
      officia deserunt mollit anim id est laborum.
      </Text>
      <Text style={styles.paragraph}>Venenatis mauris erat hendrerit vehicula sem
      ultrices aliquet posuere,
      velit aenean gravida suscipit morbi habitasse cubilia, eros tortor
      semper odio facilisi curae natoque ullamcorper, nisl potenti blandit
      tempus pharetra mi. Diam cubilia facilisi suspendisse non cras proin
      orci feugiat, pulvinar curabitur dictum enim at risus platea mauris,
      porttitor ridiculus et nisi imperdiet quis placerat. Auctor feugiat
      laoreet in augue malesuada duis morbi consequat semper cursus enim,
      sed nostra praesent montes class convallis penatibus justo massa arcu,
      tellus porta platea mi blandit facilisis felis netus nullam venenatis.
      </Text>
      <Text style={styles.paragraph}>Lorem ipsum dolor sit amet,
      consectetur adipiscing elit, sed do eiusmod tempor incididunt
      ut labore et dolore magna aliqua. Ut enim ad minim veniam,
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex
      ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
      officia deserunt mollit anim id est laborum.
      </Text>
    </ScrollView>
  </View>
);

PrivacyPolicyScreen.navigationOptions = ({ navigation }) => ({
  // title: i18n.t('reservation.title'),
  title: i18n.t('privacyPolicy.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default PrivacyPolicyScreen;
