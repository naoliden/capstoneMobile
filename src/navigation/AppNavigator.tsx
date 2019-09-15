import {
  createAppContainer,
  createSwitchNavigator,
  createStackNavigator,
} from 'react-navigation';
import MainTabNavigator from './MainTabNavigator';
import SignUpScreen from '../screens/SignUpScreen';
import SentEmailScreen from '../screens/SentEmailScreen';
import LoginScreen from '../screens/LoginScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import RestorePasswordScreen from '../screens/RestorePasswordScreen';
import ChangePasswordRestoreScreen from '../screens/ChangePasswordRestoreScreen';
import { BLUE, WHITE } from '../config/colors';

const LoginNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    Terms: TermsOfUseScreen,
    Privacy: PrivacyPolicyScreen,
    SignUpScreen,
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: BLUE,
      },
      headerTitleStyle: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '500',
        color: WHITE,
      },
    },
    headerLayoutPreset: 'center',
  },
);

const AppNavigator = createSwitchNavigator({
  Login: LoginNavigator,
  Main: MainTabNavigator,
  ConfirmEmail: SentEmailScreen,
  Terms: TermsOfUseScreen,
  RestorePasswordScreen,
  ChangePasswordRestore: ChangePasswordRestoreScreen,
});


export default createAppContainer(AppNavigator);
