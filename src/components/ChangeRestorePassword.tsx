import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Container,
  Content,
} from 'native-base';
import { Button } from 'react-native-elements';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import i18n from 'i18n-js';
import {
  BLUE,
  GRAY,
} from '../config/colors';

const { width } = Dimensions.get('window');

const RESTORE_STEP_TWO = gql`
  mutation recoverPasswordStep2($email: String!, $password: String!, $token: String!) {
    recoverPasswordStep2(input: { email: $email, password: $password, token: $token }) {
      state
    }
  }
`;


const handleError = () => {
  Alert.alert('There was an error. Please try again!');
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    flex: 1,
    marginTop: 60,
  },
  contentContainer: {
    padding: 50,
  },
  title: {
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 10,
    color: GRAY,
  },
  description: {
    fontSize: 15,
    marginBottom: 10,
    color: GRAY,
    fontWeight: '300',
  },
  codeInput: {
    borderColor: GRAY,
    borderWidth: 1,
    borderRadius: 3,
    width: 200,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'center',
    fontSize: 16,
    padding: 8,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  login: {
    fontSize: 16,
    color: BLUE,
    alignSelf: 'center',
  },
});

class ChangePassword extends React.Component {
  public static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  private constructor(props) {
    super(props);
    this.state = {
      code: '',
      password: '',
      confirmPassword: '',
    };

    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
  }

  private handleCodeChange(code: string) {
    this.setState({ code });
  }

  private handlePasswordChange(password: string) {
    this.setState({ password });
  }

  private handleConfirmPasswordChange(confirmPassword: string) {
    this.setState({ confirmPassword });
  }

  private handleCompletion(data: { recoverPasswordStep2: { state: number } }) {
    const { state } = data.recoverPasswordStep2;
    const { navigation } = this.props;
    if (state === 1) {
      Alert.alert('Password successfully changed');
      navigation.navigate('Login');
    } else {
      Alert.alert('Invalid code, please try again');
    }
  }

  private toggleButtonState() {
    const { code, password, confirmPassword } = this.state;
    if (code && password && confirmPassword) {
      return false;
    }
    return true;
  }

  private handleOnPress(mutation) {
    const { password, confirmPassword } = this.state;
    if (password === confirmPassword) {
      mutation();
    } else {
      Alert.alert('Password and Confirm password must match');
    }
  }

  public render() {
    const { navigation } = this.props;
    const { navigate } = navigation;
    const { code, password } = this.state;
    const email = navigation.getParam('email', '');
    return (
      <Container>
        <Content style={{ width, paddingTop: 30 }}>
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Change password</Text>
              <Text style={styles.description}>
                Please, enter the code that we sent to your account to change your password.
              </Text>
              <TextInput
                onChangeText={this.handleCodeChange}
                style={styles.codeInput}
                placeholder="Code"
              />
              <TextInput
                onChangeText={this.handlePasswordChange}
                style={styles.codeInput}
                secureTextEntry
                placeholder="New password"
              />
              <TextInput
                onChangeText={this.handleConfirmPasswordChange}
                style={styles.codeInput}
                secureTextEntry
                placeholder="Confirm password"
              />
              <Mutation
                mutation={RESTORE_STEP_TWO}
                variables={{ email, password, token: code }}
                onError={() => handleError()}
                onCompleted={data => this.handleCompletion(data)}
              >
                {mutation => (
                  <Button
                    buttonStyle={styles.button}
                    onPress={() => this.handleOnPress(mutation)}
                    title="Change password"
                    disabled={this.toggleButtonState()}
                  />
                )}
              </Mutation>
              <Button
                title={i18n.t('restorePassword.toLogin')}
                type="clear"
                titleStyle={styles.login}
                onPress={() => navigate('Login')}
              />
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

export default withNavigation(ChangePassword);
