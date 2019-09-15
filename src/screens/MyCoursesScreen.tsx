import * as React from 'react';
import * as PropTypes from 'prop-types';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import MyUserCoursesComponent from '../components/MyUserCoursesComponent';
import MyTutorCoursesComponent from '../components/MyTutorCoursesComponent';
import { BLUE } from '../config/colors';
import NewCourseButton from '../components/NewCourseButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  navButton: {
    marginTop: Platform.OS === 'ios' ? 10 : -10,
  },
});

class MyCoursesScreen extends React.Component {
  public static propTypes = {
    mode: PropTypes.bool,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    tutorId: PropTypes.number,
    id: PropTypes.number.isRequired,
    currentLanguage: PropTypes.string.isRequired,
  };

  public static defaultProps = {
    mode: false,
    tutorId: null,
  };

  public static navigationOptions = ({ navigation }) => {
    const mode = navigation.getParam('mode');
    return {
      title: i18n.t('myCourses.title'),
      headerRight: mode
        ? (<NewCourseButton navigation={navigation} style={styles.navButton} />)
        : null,
    };
  };

  private componentWillMount() {
    const { mode, navigation } = this.props;
    navigation.setParams({
      mode,
    });
  }

  private componentDidUpdate(prevProps) {
    const { currentLanguage, mode, navigation } = this.props;
    if (currentLanguage !== prevProps.currentLanguage || mode !== prevProps.mode) {
      navigation.setParams({
        title: i18n.t('myCourses.title'),
        mode,
      });
      this.forceUpdate();
    }
  }

  public render() {
    const {
      navigation, mode, tutorId, id,
    } = this.props;
    if (mode) {
      return (
        <SafeAreaView style={styles.container}>
          <MyTutorCoursesComponent navigation={navigation} tutorId={tutorId} />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.container}>
        <MyUserCoursesComponent navigation={navigation} id={id} />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { mode, user } = state.login;
  const { tutorId, id } = user;
  return {
    mode, tutorId, id, currentLanguage,
  };
};

export default withNavigation(connect(mapStateToProps)(MyCoursesScreen));
