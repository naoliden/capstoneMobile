import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Spinner } from 'native-base';
import {
  Image,
  Avatar,
  Divider,
  Button,
  Rating,
} from 'react-native-elements';
import i18n from 'i18n-js';
import {
  showTutor, changeCourseModal, saveCourseReviews, changeLanguage,
} from '../actions';
import ShowReviews from './ShowReviews';
import { BLUE, GRAY, LIGHT_GRAY } from '../config/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  bodyDataDescription: {
    fontSize: 16,
    color: GRAY,
    fontWeight: '300',
  },
  titleDataLocation: {
    fontSize: 14,
    color: GRAY,
    fontWeight: '300',
  },
  titleDataSpecialty: {
    fontSize: 14,
    color: GRAY,
  },
  bodyDataCategory: {
    fontSize: 16,
    color: GRAY,
  },
  bodyData: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    flex: 1,
    flexDirection: 'row',
  },
  avatarArea: {
    width: '25%',
  },
  tutorInfoArea: {
    width: '75%',
  },
  titleData: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
  },
  courseName: {
    fontSize: 25,
    color: GRAY,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 20,
    color: GRAY,
  },
  headerSubtitleTutor: {
    fontSize: 20,
    color: BLUE,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    margin: 10,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    marginLeft: 20,
    marginRight: 20,
  },
  buttonText: {
    padding: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class CourseViewComponent extends React.Component {
  public static propTypes = {
    currentLanguage: PropTypes.string.isRequired,
    tutorId: PropTypes.number,
    course: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
      tutor: PropTypes.shape({
        id: PropTypes.string.isRequired,
        specialty: PropTypes.string.isRequired,
        user: PropTypes.shape({
          firstName: PropTypes.string.isRequired,
          lastName: PropTypes.string.isRequired,
          email: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    dispatchShowTutor: PropTypes.func.isRequired,
    dispatchChangeVisibility: PropTypes.func.isRequired,
    dispatchSaveReviews: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    refetch: PropTypes.func.isRequired,
    mode: PropTypes.bool.isRequired,
    visibleModalCourse: PropTypes.bool.isRequired,
  }

  public constructor(props) {
    super(props);
    const { course, dispatchShowTutor } = props;
    const { id } = course.tutor;
    dispatchShowTutor(parseInt(id, 10));
    this.ratingHandler(false);
  }


  public componentDidUpdate(prevProps: {}) {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  }

  private onPressTutor = (id: string) => {
    const { dispatchShowTutor } = this.props;
    dispatchShowTutor(parseInt(id, 10));
    const { navigation } = this.props;
    navigation.navigate('ExploreTutor');
  }


  private toggleEditButton() {
    const { tutorId, course, mode } = this.props;
    if (mode) {
      if (tutorId && tutorId !== 'null') {
        if (parseInt(tutorId, 10) === parseInt(course.tutor.id, 10)) {
          return true;
        }
      }
    }
    return false;
  }

  public ratingHandler(visible: boolean) {
    const { dispatchChangeVisibility, dispatchSaveReviews, course } = this.props;
    dispatchSaveReviews(course.reviews);
    dispatchChangeVisibility(visible);
  }

  private toggleRequestButton() {
    const { tutorId, course, mode } = this.props;
    if (mode) {
      if (tutorId && tutorId !== 'null') {
        if (parseInt(tutorId, 10) === parseInt(course.tutor.id, 10)) {
          return false;
        }
      }
    }
    return true;
  }

  private showRating() {
    const { course } = this.props;
    const { numberOfReviewsRecived, gradeAverage } = course;
    if (numberOfReviewsRecived > 0) {
      return (
        <TouchableWithoutFeedback
          style={{ flex: 1 }}
          onPress={() => {
            this.ratingHandler(true);
          }}
        >
          <View style={styles.ratingContainer}>
            <Rating
              imageSize={20}
              readonly
              startingValue={gradeAverage}
            />
            <Text style={{ fontSize: 20, color: BLUE }}>({numberOfReviewsRecived})</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return (
      <View />
    );
  }

  public render() {
    const {
      course,
      navigation,
      refetch,
      visibleModalCourse,
    } = this.props;
    const {
      name, price, address, city, country, description, availableSeats,
      tutor, youtubeLink, labelIndex, images,
    } = course;
    const { id, user, specialty } = tutor;
    const { firstName, lastName, photo } = user;
    const categoryList = [];
    labelIndex.forEach((label: object) => {
      categoryList.push(label.category);
    });
    const idList = [];
    labelIndex.forEach((label: object) => {
      idList.push(label.id);
    });
    const categories = categoryList.join(', ');
    let sourcePicture;
    if (photo) {
      sourcePicture = photo;
    } else {
      sourcePicture = 'https://bootdey.com/img/Content/avatar/avatar2.png';
    }
    return (
      <SafeAreaView>
        <Modal
          animationType="slide"
          transparent={false}
          visible={visibleModalCourse}
        >
          <ShowReviews tutorId={parseInt(course.id, 10)} modalType="course" />
        </Modal>
        <ScrollView>
          {(images.length === 0) && (
            <Image
              source={{ uri: 'https://online-learning.harvard.edu/sites/default/files/styles/header/public/course/asset-v1_HarvardX%2BCalcAPL1x%2B2T2017%2Btype%40asset%2Bblock%40TITLE-Calculus-Applied-2120x1192-NO-SPOTLIGHT%202.png?itok=crWwjmVi' }}
              style={{ width: 400, height: 200 }}
              resizeMode="cover"
            />
          )}
          {(images && images.length === 1) && (
            <Image
              source={{ uri: images[0].url }}
              style={{ width: 400, height: 200 }}
              resizeMode="cover"
            />
          )}
          {(images && images.length > 1) && (
            <View
              style={styles.scrollContainer}
            >
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={(ref) => { this.scrollView = ref; }}
              >
                {images.map((item: object, key) => (
                  <Image
                    source={{ uri: item.url }}
                    style={{ width, height: 200 }}
                    key={String(key).concat(item.image)}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.titleData}>
            <Text style={styles.courseName}> {name} </Text>
            {this.showRating()}
            <Text style={styles.headerSubtitle}>
              US ${price}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.bodyData}>
            <View style={styles.avatarArea}>
              <Avatar
                rounded
                size="large"
                source={{ uri: sourcePicture }}
                onPress={() => this.onPressTutor(id)}
              />
            </View>
            <View style={styles.tutorInfoArea}>
              <Text style={styles.titleDataLocation}>{city}, {country} </Text>
              <Text style={{ marginBottom: 5 }}>
                <Text style={styles.headerSubtitle}>
                  {i18n.t('courseView.dictatedBy')}
                </Text>
                <Text style={styles.headerSubtitleTutor} onPress={() => this.onPressTutor(id)}>
                  {firstName} {lastName}
                </Text>
              </Text>
              <Text style={styles.titleDataSpecialty}>{i18n.t('courseView.specialty')}{specialty}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={{ paddingHorizontal: 25, paddingVertical: 10 }}>
            <Text style={{ marginBottom: 10 }}>
              <Text style={styles.bodyDataCategory}>{i18n.t('courseView.description')}</Text>
              <Text style={styles.bodyDataDescription}>{description}</Text>
            </Text>
            <Text style={{ marginBottom: 10 }}>
              <Text style={styles.bodyDataCategory}>{i18n.t('courseView.courseAddress')}</Text>
              <Text style={styles.bodyDataDescription}>{address}</Text>
            </Text>
            <Text style={{ marginBottom: 10 }}>
              <Text style={styles.bodyDataCategory}>{i18n.t('courseView.availableSeats')}</Text>
              <Text style={styles.bodyDataDescription}>{availableSeats}</Text>
            </Text>
            <Text style={{ marginBottom: 10 }}>
              <Text style={styles.bodyDataCategory}>{i18n.t('courseView.categories')}</Text>
              <Text style={styles.bodyDataDescription}>{categories}</Text>
            </Text>
          </View>
          {this.toggleRequestButton() && (
            <Button
              title={i18n.t('courseView.request')}
              onPress={() => navigation.navigate('ApplyCourse', {
                price,
              })}
              buttonStyle={styles.button}
            />
          )}
          {this.toggleEditButton() && (
            <Button
              title={i18n.t('courseView.edit')}
              buttonStyle={styles.button}
              onPress={() => navigation.navigate('EditCourse', {
                id: course.id,
                name,
                price,
                description,
                address,
                city,
                country,
                availableSeats,
                youtubeLink,
                labelIndex,
                idList,
                refetch,
                images,
              })}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { user, mode } = state.login;
  const { visibleModalCourse, courseReviews } = state.reviews;
  const { tutorId } = user;
  return {
    currentLanguage,
    tutorId,
    mode,
    visibleModalCourse,
    courseReviews,
  };
};

const mapDispatchToProps = {
  dispatchShowTutor: showTutor,
  dispatchChangeVisibility: changeCourseModal,
  dispatchSaveReviews: saveCourseReviews,
  dispatchLanguage: changeLanguage,
};

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(CourseViewComponent),
);

const GET_COURSE = gql`
  query course($id: Int!) {
    course(id: $id) {
      id
      name
      price
      description
      address
      country
      city
      availableSeats
      images{
        url
      }
      labelIndex {
        category
        id
      }
      tutorId
      tutor{
        id
        specialty
        user{
          id
          firstName
          lastName
          email
          photo
        }
      }
      reviews{
        id
        userId
        comment
        grade
        createdAt
        user{
          id
          firstName
          lastName
        }
      }
      numberOfReviewsRecived
      gradeAverage
    }
  }
`;

const ShowCourse = ({ id }) => (
  <Query query={GET_COURSE} variables={{ id }}>
    {({
      loading,
      error,
      data,
      refetch,
    }) => {
      if (loading) return (<Spinner color="#3067BA" />);
      if (error) return (<Text> Oops, Error! {error.message} </Text>);
      return (
        <ComponentWithNavigation course={data.course} refetch={refetch} />
      );
    }}
  </Query>
);

ShowCourse.propTypes = {
  id: PropTypes.number.isRequired,
};

CourseViewComponent.defaultProps = {
  tutorId: null,
};

export default ShowCourse;
