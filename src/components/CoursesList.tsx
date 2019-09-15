import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
// import i18n from 'i18n-js';
import CourseView from './CourseListView';
import TutorView from './TutorListView';
import CourseFilters from './CourseFilters';
import {
  showCourse,
  saveCourses,
  saveAllCourses,
  saveTutors,
  saveAllTutors,
  showTutor,
  addWord,
  changeLanguage,
} from '../actions';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  titleCourse: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 20,
    margin: 10,
    marginTop: 0,
  },
});

class CoursesList extends React.Component {
  public static propTypes = {
    currentLanguage: PropTypes.string.isRequired,
    networkStatusCourses: PropTypes.number.isRequired,
    networkStatusTutors: PropTypes.number.isRequired,
    switchValue: PropTypes.bool.isRequired,
    coursesObj: PropTypes.arrayOf(PropTypes.object).isRequired,
    tutorsObj: PropTypes.arrayOf(PropTypes.object).isRequired,
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    tutors: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatchShowCourse: PropTypes.func.isRequired,
    dispatchSaveCourses: PropTypes.func.isRequired,
    dispatchSaveAllCourses: PropTypes.func.isRequired,
    dispatchShowTutor: PropTypes.func.isRequired,
    dispatchSaveTutors: PropTypes.func.isRequired,
    dispatchSaveAllTutors: PropTypes.func.isRequired,
    dispatchAddWord: PropTypes.func.isRequired,
    refetchCourses: PropTypes.func.isRequired,
    refetchTutors: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  public componentDidMount() {
    const {
      dispatchSaveCourses,
      dispatchSaveAllCourses,
      dispatchSaveTutors,
      dispatchSaveAllTutors,
      tutorsObj,
      coursesObj,
    } = this.props;
    dispatchSaveCourses(coursesObj);
    dispatchSaveAllCourses(coursesObj);
    dispatchSaveTutors(tutorsObj);
    dispatchSaveAllTutors(tutorsObj);
  }

  private componentDidUpdate(prevProps) {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  }

  private renderFooter = () => (
    <View style={{ padding: 10 }}>
      <Text style={{ color: 'white' }}> footer </Text>
    </View>
  );

  private onPressCourse = (id: string) => {
    const { dispatchShowCourse, navigation } = this.props;
    dispatchShowCourse(parseInt(id, 10));
    navigation.navigate('ExploreCourse');
  }

  private onPressTutor = (id: string) => {
    const { dispatchShowTutor } = this.props;
    dispatchShowTutor(parseInt(id, 10));
    const { navigation } = this.props;
    navigation.navigate('ExploreTutor');
  }

  private keyExtractor = (item: object) => String(item.id)

  public async refetchData() {
    const { refetchCourses, refetchTutors, dispatchAddWord } = this.props;
    dispatchAddWord('');
    await Promise.all([refetchCourses(), refetchTutors()]);
    const {
      dispatchSaveCourses,
      dispatchSaveAllCourses,
      dispatchSaveTutors,
      dispatchSaveAllTutors,
      tutorsObj,
      coursesObj,
    } = this.props;
    dispatchSaveCourses(coursesObj);
    dispatchSaveAllCourses(coursesObj);
    dispatchSaveTutors(tutorsObj);
    dispatchSaveAllTutors(tutorsObj);
  }


  private renderItem = ({ item }) => {
    if (item.__typename === 'course') {
      const categoryList = [];
      item.labelIndex.forEach((label: object) => {
        categoryList.push(label.category);
      });
      const categories = categoryList.join(', ');
      return (
        <TouchableOpacity onPress={() => this.onPressCourse(item.id)}>
          <CourseView
            width={width}
            name={item.name}
            type={categories}
            price={item.price}
            rating={item.gradeAverage}
            images={item.images}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => this.onPressTutor(item.id)}>
        <TutorView
          width={width}
          firstName={item.user.firstName}
          lastName={item.user.lastName}
          specialty={item.specialty}
          // description={item.description}
          photo={item.user.photo}
          rating={item.gradeAverage}
        />
      </TouchableOpacity>
    );
  }

  public render() {
    const {
      courses,
      tutors,
      switchValue,
      networkStatusCourses,
      networkStatusTutors,
    } = this.props;
    let data;
    if (switchValue) {
      data = tutors;
    } else {
      data = courses;
    }
    return (
      <View>
        {!switchValue && (
          <View style={{ marginBottom: 35 }}>
            <CourseFilters />
          </View>
        )}
        <FlatList
          numColumns={2}
          contentContainerStyle={styles.container}
          data={data}
          keyExtractor={(item, index) => String(index)}
          renderItem={this.renderItem}
          ListEmptyComponent={<Text>No courses yet!</Text>}
          refreshing={networkStatusCourses === 4 || networkStatusTutors === 4}
          onRefresh={() => this.refetchData()}
          ListFooterComponent={this.renderFooter()}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { switchValue } = state.searchBar;
  const {
    course,
    courses,
    tutor,
    tutors,
  } = state.courses;
  return {
    currentLanguage,
    course,
    courses,
    tutor,
    tutors,
    switchValue,
  };
};

const mapDispatchToProps = {
  dispatchShowCourse: showCourse,
  dispatchSaveCourses: saveCourses,
  dispatchSaveAllCourses: saveAllCourses,
  dispatchSaveTutors: saveTutors,
  dispatchSaveAllTutors: saveAllTutors,
  dispatchShowTutor: showTutor,
  dispatchAddWord: addWord,
  dispatchLanguage: changeLanguage,
};

const CoursesWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(CoursesList),
);

const GET_COURSES = gql`
  {
    activeCourses(limit: 20) {
      id
      name
      price
      description
      address
      gradeAverage
      images{
        courseId
        url
      }
      labelIndex{
        category
        id
      }
    }
  }
`;

const GET_TUTORS = gql`
  {
    tutors(limit: 20){
      id
      description
      specialty
      gradeAverage
      user{
        id
        firstName
        lastName
        photo
      }
    }
  }
`;

const Courses = () => (
  <Query query={GET_COURSES} notifyOnNetworkStatusChange>
    {({
      loading: loadingOne,
      error: errorOne,
      data: dataOne,
      refetch: refetchOne,
      networkStatus: networkStatusOne,
    }) => (
      <Query query={GET_TUTORS} notifyOnNetworkStatusChange>
        {({
          loading: loadingTwo,
          error: errorTwo,
          data: dataTwo,
          refetch: refetchTwo,
          networkStatus: networkStatusTwo,
        }) => {
          if ((loadingOne && networkStatusOne !== 4) || (loadingTwo && networkStatusTwo !== 4)) return (<Spinner color="#3067BA" />);
          if (errorOne) return (<Text> Error! {errorOne.message} </Text>);
          if (errorTwo) return (<Text> Error! {errorTwo.message} </Text>);
          return (
            <CoursesWithNavigation
              coursesObj={dataOne.activeCourses}
              tutorsObj={dataTwo.tutors}
              refetchCourses={refetchOne}
              refetchTutors={refetchTwo}
              networkStatusCourses={networkStatusOne}
              networkStatusTutors={networkStatusTwo}
            />
          );
        }}
      </Query>
    )}
  </Query>
);

export default Courses;
