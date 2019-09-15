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
import { Query } from 'react-apollo';
import {
  Spinner, Container, Tab, Tabs, ScrollableTab,
} from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import { Button } from 'react-native-elements';
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
import PrivateLessonRequests from './PrivateLessonRequests';

const GET_RESERVATIONS_BY_USER = gql`
  query classReservationsFilterByUser($id: Int!) {
    classReservationsFilterByUser(id: $id) {
      id
      course {
        id
        name
        description
        images {
          courseId
          url
        }
      }
      tutorAvailability {
        id
        date
        hour
      }
    }
  }
`;

const GET_PAST_FUTURE_COURSES = gql`
query classReservations($pastReservation: Boolean, $userId: ID, $futureReservation: Boolean){
  classReservations(input: {pastReservation: $pastReservation, userId: $userId, futureReservation: $futureReservation}){
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
      tutor{
        id
        user{
          id
          firstName
          lastName
        }
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
    label: 'Past Courses...',
    value: 'key1',
  },
];


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  message: {
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    alignSelf: 'center',
    fontWeight: '500',
    color: GRAY,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    marginBottom: 70,
    marginTop: 30,
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

function showMyReservations(pastReservation: boolean, userId: number,
  dispatchShowCourse, navigation) {
  const futureReservation = !pastReservation;
  return (
    <Query
      query={GET_PAST_FUTURE_COURSES}
      variables={{ pastReservation, userId, futureReservation }}
      notifyOnNetworkStatusChange
    >
      {({
        loading, error, data, refetch, networkStatus,
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
                You do not have any class reservations yet!
                  Every day you can learn something new,
                  search for courses and tutors in the explore page.
              </Text>
              <Button
                buttonStyle={styles.button}
                onPress={() => navigation.navigate('ExploreCourses')}
                title="Go to explore page"
              />
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
    data: PropTypes.shape({
      classReservationsFilterByUser: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
    dispatchShowCourse: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
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
    const { id, dispatchShowCourse, navigation } = this.props;
    const { selectedOption } = this.state;
    if (selectedOption === 'key0') {
      return showMyReservations(false, parseInt(id, 10), dispatchShowCourse, navigation);
    }
    return showMyReservations(true, parseInt(id, 10), dispatchShowCourse, navigation);
  }

  private changeValue(value: string) {
    this.setState({
      selectedOption: value,
    });
  }

  public render() {
    const {
      id,
    } = this.props;

    const placeholder = {
      label: 'Upcoming Courses...',
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
            <CoursesCalendar id={id} tutor={false} />
          </Tab>
          <Tab
            heading="Private Lessons Requests"
            tabStyle={{ backgroundColor: BLUE }}
            textStyle={{ color: WHITE }}
            activeTabStyle={{ backgroundColor: BLUE }}
            activeTextStyle={{ color: WHITE }}
          >
            <PrivateLessonRequests tutor={false} />
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { id } = state.login.user;
  return { id };
};

const mapDispatchToProps = dispatch => ({
  dispatchShowCourse: (courseId) => {
    dispatch(showCourse(courseId));
  },
});

const ConnectedComponent = withNavigation(connect(mapStateToProps, mapDispatchToProps)(MyCourses));

const MyCoursesQuery = (props) => {
  const {
    id,
  } = props;
  return (
    <Query
      query={GET_RESERVATIONS_BY_USER}
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
        return (
          <ConnectedComponent
            data={data}
            refetch={refetch}
            networkStatus={networkStatus}
          />
        );
      }}
    </Query>
  );
};

MyCoursesQuery.propTypes = {
  id: PropTypes.number.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};


export default MyCoursesQuery;
