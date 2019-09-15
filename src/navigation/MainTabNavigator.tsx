import * as React from 'react';
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TutorProfileScreen from '../screens/TutorProfileScreen';
import CourseViewScreen from '../screens/CourseViewScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NewCourseScreen from '../screens/NewCourseScreen';
import MyCoursesScreen from '../screens/MyCoursesScreen';
import EditCourseScreen from '../screens/EditCourseScreen';
import AvailabilitySelectionScreen from '../screens/AvailabilitySelectionScreen';
import TutorAvailabilityScreen from '../screens/TutorAvailabilityScreen';
import ApplyCourseScreen from '../screens/ApplyCourseScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import ChangeProfilePictureScreen from '../screens/ChangeProfilePictureScreen';
import AddCoursePictureScreen from '../screens/AddCoursePictureScreen';
import NotificationsScreen from '../screens/NotificationScreen';
import NotificationIcon from '../components/NotificationBadge';
import TutorRequestScreen from '../screens/TutorRequestScreen';
import BecomeTutorScreen from '../screens/BecomeTutorScreen';
import ReservationScreen from '../screens/ReservationScreen';
import OpenDisputeScreen from '../screens/OpenDisputeScreen';
import MyDisputesScreen from '../screens/MyDisputesScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import RequestLessonsScreen from '../screens/RequestLessonsScreen';
import { GRAY, BLUE, WHITE } from '../config/colors';

const ExploreStack = createStackNavigator(
  {
    ExploreCourses: HomeScreen,
    ExploreCourse: CourseViewScreen,
    ExploreTutor: TutorProfileScreen,
    EditCourse: EditCourseScreen,
    ShowAvailability: TutorAvailabilityScreen,
    ApplyCourse: ApplyCourseScreen,
    AddCoursePicture: AddCoursePictureScreen,
    RequestLessons: RequestLessonsScreen,
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

const MyCoursesStack = createStackNavigator(
  {
    MyCourses: MyCoursesScreen,
    CreateCourse: NewCourseScreen,
    Course: CourseViewScreen,
    EditCourse: EditCourseScreen,
    AddCoursePicture: AddCoursePictureScreen,
    Reservation: ReservationScreen,
    AddReview: WriteReviewScreen,
    Dispute: OpenDisputeScreen,
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

const MessagesStack = createStackNavigator(
  {
    ChatList: ChatListScreen,
    Chat: ChatScreen,
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

MessagesStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map((route) => {
      if (route.routeName === 'Chat') {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
      return 0;
    });
  }
  return {
    tabBarVisible,
  };
};
const ProfileStack = createStackNavigator(
  {
    MyProfile: MyProfileScreen,
    EditProfile: EditProfileScreen,
    ChangePassword: ChangePasswordScreen,
    Availability: AvailabilitySelectionScreen,
    ShowAvailability: TutorAvailabilityScreen,
    Settings: SettingsScreen,
    Transactions: TransactionHistoryScreen,
    TransactionDetails: TransactionDetailsScreen,
    ChangeProfilePicture: ChangeProfilePictureScreen,
    BecomeTutor: BecomeTutorScreen,
    Disputes: MyDisputesScreen,
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

const NotificationsStack = createStackNavigator({
  MyNotifications: NotificationsScreen,
  Reservation: ReservationScreen,
  TutorResponse: TutorRequestScreen,
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

const TabNavigator = createBottomTabNavigator({
  Explore: ExploreStack,
  Messages: MessagesStack,
  'My Courses': MyCoursesStack,
  Notifications: NotificationsStack,
  Profile: ProfileStack,
},
{
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Notifications') {
        return <NotificationIcon tintColor={tintColor} />;
      }
      if (routeName === 'Explore') {
        iconName = 'ios-search';
      } else if (routeName === 'My Courses') {
        iconName = 'ios-calendar';
      } else if (routeName === 'Messages') {
        iconName = 'ios-chatbubbles';
      } else if (routeName === 'Profile') {
        iconName = 'md-person';
      }
      return <Ionicons name={iconName} size={25} color={tintColor} />;
    },
  }),
  tabBarOptions: {
    activeTintColor: BLUE,
    inactiveTintColor: GRAY,
    inactiveBackgroundColor: 'white',
    activeBackgroundColor: 'white',
    labelStyle: {
      fontSize: 10,
      fontWeight: '300',
    },
  },
});

export default createAppContainer(TabNavigator);
