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
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import {
  BLUE,
  GRAY,
} from '../config/colors';

const { width } = Dimensions.get('window');

const RESTORE_STEP_ONE = gql`
  mutation recoverPasswordStep1($email: String!, $language: String!) {
    recoverPasswordStep1(input: { email: $email }, language: $language ) {
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
    marginTop: 100,
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
    fontSize: 16,
    fontWeight: '300',
    color: GRAY,
    marginBottom: 10,
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

class RestorePassword extends React.Component {
  public static propTypes = {
    currentLanguage: PropTypes.string.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  private constructor(props) {
    super(props);
    this.state = {

      email: '',
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
  }

  private componentDidUpdate(prevProps) {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  }

  private mapStateToProps = (state: object) => {
    const { currentLanguage } = state.langs;
    return { currentLanguage };
  };

  private handleEmailChange(email: string) {
    this.setState({ email });
  }

  private handleCompletion(data: { recoverPasswordStep1: { state: number } }) {
    const { state } = data.recoverPasswordStep1;
    const { email } = this.state;
    const { navigation } = this.props;
    if (state === 1) {
      navigation.navigate('ChangePasswordRestore', { email });
    } else {
      Alert.alert('Invalid email, please try again');
    }
  }

  private toggleButtonState() {
    const { email } = this.state;
    if (email) {
      return false;
    }
    return true;
  }

  public render() {
    const { navigation } = this.props;
    const { navigate } = navigation;
    const { email } = this.state;
    return (
      <Container>
        <Content style={{ width, paddingTop: 30 }}>
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{i18n.t('restorePassword.title')}</Text>
              <Text style={styles.description}>
                {i18n.t('restorePassword.description')}
              </Text>
              <TextInput
                onChangeText={this.handleEmailChange}
                style={styles.codeInput}
                placeholder={i18n.t('restorePassword.email')}
              />
              <Mutation
                mutation={RESTORE_STEP_ONE}
                variables={{ email, language: 'english' }}
                onError={() => handleError()}
                onCompleted={data => this.handleCompletion(data)}
              >
                {mutation => (
                  <Button
                    buttonStyle={styles.button}
                    onPress={() => mutation()}
                    title={i18n.t('buttons.restorePassword')}
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

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  return { currentLanguage };
};

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps)(RestorePassword),
);

export default ComponentWithNavigation;
