import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Button } from 'react-native-elements';
import { showCourse } from '../actions';
import TutorProfileComponent from './TutorProfileComponent';
import { CourseCard } from './ProfileUtils';
import {
  GRAY,
  BLUE,
} from '../config/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listTitle: {
    color: GRAY,
    fontSize: 18,
    alignSelf: 'flex-start',
    marginHorizontal: 25,
    marginBottom: 5,
  },
  button: {
    backgroundColor: BLUE,
    alignSelf: 'center',
    marginVertical: 20,
    width: 250,
  },
  description: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
});

class TutorCoursesListComponent extends React.Component {
  public static propTypes = {
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatchShowCourse: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    tutor: PropTypes.number.isRequired,
  }

  private renderFooter = () => {
    const { navigation } = this.props;
    return (
      <Button
        title="Request private lessons"
        buttonStyle={styles.button}
        onPress={() => navigation.navigate('RequestLessons')}
      />
    );
  }

  private renderHeader = tutor => (
    <View>
      <TutorProfileComponent id={tutor} />
      <Text style={styles.listTitle}>Courses</Text>
    </View>
  );

  private onPressCourse = (id: string) => {
    const { dispatchShowCourse } = this.props;
    dispatchShowCourse(parseInt(id, 10));
    const { navigation } = this.props;
    navigation.navigate('ExploreCourse');
  }

  private keyExtractor = (item: object) => String(item.id)

  private renderItem = ({ item }) => (
    <CourseCard onPress={() => this.onPressCourse(item.id)} item={item} />
  )

  public render() {
    const { courses } = this.props;
    const { tutor } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={courses}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListEmptyComponent={<Text>No courses yet!</Text>}
          ListHeaderComponent={this.renderHeader(tutor)}
          ListFooterComponent={this.renderFooter()}
        />
      </View>
    );
  }
}


const mapStateToProps = (state: object) => {
  const { tutor } = state.courses;
  return { tutor };
};

const mapDispatchToProps = {
  dispatchShowCourse: showCourse,
};

const CoursesWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(TutorCoursesListComponent),
);

const GET_COURSE = gql`
query tutorCourse($tutor: Int!) {
  tutorCourses(id: $tutor) {
    id
    specialty
    user {
      id
      lastName
      firstName
    }
    coursesTeached {
      name
      description
      id
      images{
        courseId
        url
      }
    }
  }
}
`;

const tutorCourses = ({ tutor }) => (
  <Query query={GET_COURSE} variables={{ tutor }}>
    {({ loading, error, data }) => {
      if (loading) return (<Spinner color={BLUE} />);
      if (error) return (<Text> Error! {error.message} </Text>);
      return (
        <CoursesWithNavigation courses={data.tutorCourses.coursesTeached} />
      );
    }}
  </Query>
);

tutorCourses.propTypes = {
  tutor: PropTypes.number.isRequired,
};


export default connect(mapStateToProps)(tutorCourses);
