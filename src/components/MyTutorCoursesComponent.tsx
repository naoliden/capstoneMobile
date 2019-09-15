/* eslint-disable react/prefer-stateless-function */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import RNPickerSelect from 'react-native-picker-select';
import { Query, compose, withApollo } from 'react-apollo';
import {
  Spinner,
  Container,
  Tab,
  Tabs,
  ScrollableTab,
} from 'native-base';
import { Button as ButtonRNE } from 'react-native-elements';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { showCourse } from '../actions';
import {
  BLUE,
  GRAY,
  LIGHT_GRAY,
  WHITE,
} from '../config/colors';
import ListItems from './ListItemsComponent';
import CoursesCalendar from './CoursesCalendar';
import PendingPayment from './PendingPayment';
import PrivateLessonRequests from './PrivateLessonRequests';

const GET_TUTOR_COURSES = gql`
query tutorCourses($id: Int!) {
  tutorCourses(id: $id) {
    id
    coursesTeached {
      id
      name
      description
      images {
        courseId
        url
      }
    }
  }
}
`;

const GET_PAST_FUTURE_COURSES = gql`
query classReservations($pastReservation: Boolean, $tutorId: Int!, $futureReservation: Boolean){
  classReservations(input: {pastReservation: $pastReservation, tutorId: $tutorId, futureReservation: $futureReservation}){
    id
    course{
      id
      name
      price
      currency
      description
      images {
        courseId
        url
      }
    }
    tutorAvailability{
      id
      date
      hour
    }
    user{
      id
      firstName
      lastName
    }
  }
}
`;

const options = [
  {
    label: 'Pending Courses...',
    value: 'key3',
  },
  {
    label: 'Past Courses...',
    value: 'key1',
  },
  {
    label: 'Upcoming Courses...',
    value: 'key2',
  },
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    alignSelf: 'center',
    fontWeight: '500',
    color: GRAY,
  },
  message: {
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: '300',
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
  inputIOSContainer: {
    borderWidth: 0.3,
    borderRadius: 10,
    borderColor: LIGHT_GRAY,
    paddingTop: 5,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
  },
  inputIOS: {
    marginLeft: 10,
    padding: 5,
    fontSize: 20,
  },
  inputAndroid: {
    marginRight: 10,
    marginLeft: 10,
    borderWidth: 0.3,
    borderRadius: 10,
    borderColor: LIGHT_GRAY,
    paddingTop: 5,
    paddingBottom: 10,
    marginTop: 5,
  },
});

function showMyCourses(id: number, dispatchShowCourse, navigation) {
  return (
    <Query
      query={GET_TUTOR_COURSES}
      variables={{ id }}
      notifyOnNetworkStatusChange
    >
      {({
        loading,
        error,
        data,
        refetch,
        networkStatus,
      }) => {
        if (loading && networkStatus !== 4) return (<Spinner color={BLUE} />);
        if (error) return (<Text>Error! {error.message}</Text>);
        if (data.tutorCourses.coursesTeached && data.tutorCourses.coursesTeached.length === 0) {
          return (
            <ScrollView
              style={styles.container}
              refreshControl={
                (
                  <RefreshControl
                    refreshing={networkStatus === 4}
                    onRefresh={() => refetch()}
                  />
                )
              }
            >
              <Text style={styles.message}>
                You do not have any courses yet!
                Make a new course to start making incomes as a tutor.
              </Text>
              <ButtonRNE
                buttonStyle={styles.button}
                onPress={() => navigation.navigate('CreateCourse')}
                title="Create new course"
              />
            </ScrollView>
          );
        }
        return (
          <View style={{ marginBottom: 40 }}>
            <ListItems
              dispatchShowItem={dispatchShowCourse}
              items={data.tutorCourses.coursesTeached}
              refetch={refetch}
              networkStatus={networkStatus}
              tutor
              reservation={false}
            />
          </View>
        );
      }}
    </Query>
  );
}

function showMyReservations(pastReservation: boolean, tutorId: number, dispatchShowCourse) {
  const futureReservation = !pastReservation;
  return (
    <Query
      query={GET_PAST_FUTURE_COURSES}
      variables={{ pastReservation, tutorId, futureReservation }}
      notifyOnNetworkStatusChange
    >
      {({
        loading,
        error,
        data,
        refetch,
        networkStatus,
      }) => {
        if (loading && networkStatus !== 4) return (<Spinner color={BLUE} />);
        if (error) return (<Text>Error! {error.message}</Text>);
        if (data.classReservations && data.classReservations.length === 0) {
          return (
            <ScrollView
              style={styles.container}
              refreshControl={
                (
                  <RefreshControl
                    refreshing={networkStatus === 4}
                    onRefresh={() => refetch()}
                  />
                )
              }
            >
              <Text style={styles.message}>
                You do not have any reservations!
              </Text>
            </ScrollView>
          );
        }
        return (
          <View style={{ marginBottom: 40 }}>
            <ListItems
              dispatchShowItem={dispatchShowCourse}
              items={data.classReservations}
              refetch={refetch}
              networkStatus={networkStatus}
              tutor
              reservation
              past={pastReservation}
            />
          </View>
        );
      }}
    </Query>
  );
}

class MyCourses extends React.Component {
  public static propTypes = {
    dispatchShowCourse: PropTypes.func.isRequired,
    tutorId: PropTypes.number.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  public constructor(props) {
    super(props);
    this.state = {
      selectedOption: 'key0',
    };
    this.getCourses = this.getCourses.bind(this);
    this.changeValue = this.changeValue.bind(this);
  }

  private getCourses() {
    const { tutorId, dispatchShowCourse, navigation } = this.props;
    const { selectedOption } = this.state;
    const id = parseInt(tutorId, 10);
    if (selectedOption === 'key0') {
      return showMyCourses(id, dispatchShowCourse, navigation);
    }
    if (selectedOption === 'key1') {
      return showMyReservations(true, id, dispatchShowCourse);
    }
    if (selectedOption === 'key2') {
      return showMyReservations(false, id, dispatchShowCourse);
    }
    return <PendingPayment id={tutorId} />;
  }

  private changeValue(value: string) {
    this.setState({
      selectedOption: value,
    });
  }

  public render() {
    const {
      tutorId,
    } = this.props;
    const placeholder = {
      label: 'My Courses...',
      value: 'key0',
      color: GRAY,
    };
    return (
      <Container>
        <Tabs
          tabBarUnderlineStyle={{ backgroundColor: WHITE }}
          renderTabBar={() => <ScrollableTab />}
        >
          <Tab
            heading="List"
            tabStyle={{ backgroundColor: BLUE }}
            textStyle={{ color: WHITE }}
            activeTabStyle={{ backgroundColor: BLUE }}
            activeTextStyle={{ color: WHITE }}
          >
            <RNPickerSelect
              style={styles}
              placeholder={placeholder}
              items={options}
              onValueChange={value => this.changeValue(value)}
            />
            {this.getCourses()}
          </Tab>
          <Tab
            heading="Calendar"
            tabStyle={{ backgroundColor: BLUE }}
            textStyle={{ color: WHITE }}
            activeTabStyle={{ backgroundColor: BLUE }}
            activeTextStyle={{ color: WHITE }}
          >
            <CoursesCalendar id={tutorId} tutor />
          </Tab>
          <Tab
            heading="Private Lessons Requests"
            tabStyle={{ backgroundColor: BLUE }}
            textStyle={{ color: WHITE }}
            activeTabStyle={{ backgroundColor: BLUE }}
            activeTextStyle={{ color: WHITE }}
          >
            <PrivateLessonRequests tutor />
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { tutorId } = state.login.user;
  return { tutorId };
};

const mapDispatchToProps = dispatch => ({
  dispatchShowCourse: (courseId) => {
    dispatch(showCourse(courseId));
  },
});

const ConnectedComponent = withNavigation(
  compose(
    withApollo,
    connect(mapStateToProps, mapDispatchToProps),
  )(MyCourses),
);

export default ConnectedComponent;
