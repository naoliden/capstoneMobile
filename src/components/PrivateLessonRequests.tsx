import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Divider } from 'react-native-elements';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { Query } from 'react-apollo';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import {
  BLUE,
  GRAY,
  GREEN,
  LIGHT_GRAY,
} from '../config/colors';
import { parseDate } from './ProfileUtils';
import ShowLessonRequest from './ShowLessonRequest';

const styles = StyleSheet.create({
  requestContainer: {
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
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: BLUE,
    width: 150,
    alignSelf: 'center',
    marginTop: 20,
  },
  details: {
    fontSize: 16,
    color: GRAY,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  title: {
    fontWeight: '500',
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
  },
  date: {
    fontWeight: '500',
    fontSize: 14,
    color: GREEN,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    width: '100%',
    marginVertical: 10,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
  },
});

const GET_USER_PRIVATE_LESSON_REQUESTS = gql`
  {
    userParticularClassRequests{
      particularClassRequest{
        id
        user{
          id
          firstName
          lastName
        }
        tutor{
          id
          user{
            id
            firstName
            lastName
          }
        }
        tutorAvailability{
          id
          hour
          date
        }
        subject
        description
        address
        requestState
        answer
      }
    }
  }
`;

const GET_TUTOR_PRIVATE_LESSON_REQUESTS = gql`
  {
    tutorParticularClassRequests{
      particularClassRequest{
        id
        user{
          id
          firstName
          lastName
        }
        tutor{
          id
          user{
            id
            firstName
            lastName
          }
        }
        tutorAvailability{
          id
          hour
          date
        }
        subject
        description
        address
        requestState
        answer
      }
    }
  }
`;

const handleRefresh = async (refetch) => {
  await refetch();
};

class LessonRequests extends React.Component {
  public static propTypes = {
    networkStatus: PropTypes.number.isRequired,
    refetch: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    tutor: PropTypes.bool,
    requests: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  public constructor(props) {
    super(props);
    this.state = {
      requestModal: false,
      request: {},
    };
    this.requestHandler = this.requestHandler.bind(this);
  }

  private keyExtractor = (item: object) => String(item.id);

  public requestHandler(bool, request) {
    this.setState({ requestModal: bool });
    this.setState({ request });
  }

  private renderItem = ({ item }) => {
    const { tutor } = this.props;
    const {
      subject,
      address,
      requestState,
      tutorAvailability,
      user,
    } = item;
    const tutorItem = item.tutor.user;
    const { firstName, lastName } = user;
    const { date, hour } = tutorAvailability;
    return (
      <TouchableWithoutFeedback onPress={() => this.requestHandler(true, item)}>
        <View style={styles.card}>
          <View style={styles.wrapper}>
            <View style={{ width: '90%' }}>
              <Text style={styles.date}>{parseDate(date)}, {hour}</Text>
              <Text style={styles.title}>{subject}</Text>
              {tutor && (
                <Text style={styles.details}>
                  Student: {firstName} {lastName}
                </Text>
              )}
              {!tutor && (
                <Text style={styles.details}>
                  Tutor: {tutorItem.firstName} {tutorItem.lastName}
                </Text>
              )}
              <Text style={styles.details}>Address: {address}</Text>
            </View>
            <View style={{ width: '10%' }}>
              <Entypo
                name="chevron-thin-down"
                size={18}
                color={LIGHT_GRAY}
              />
            </View>
          </View>
          <Divider style={styles.divider} />
          <Text style={[styles.details, { fontWeight: '400' }]}>Total: USD $15 </Text>
          <Text style={[styles.details, { fontWeight: '400' }]}>Request state: {requestState}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  renderNothing = (item) => <TouchableWithoutFeedback><Text>{item.item.tutor.user}</Text></TouchableWithoutFeedback>
  
  public render() {
    const {
      refetch,
      networkStatus,
      requests,
      tutor,
    } = this.props;
    const { requestModal, request } = this.state;

    let data = [{tutor: {user: 'wololo'}}, {tutor: {user: 'wololo'}}, {tutor: {user: 'wololo'}}];

    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={requestModal}
        >
          <ShowLessonRequest
            request={request}
            closeModal={() => this.requestHandler(false, {})}
            tutor={tutor}
            refetch={() => handleRefresh(refetch)}
          />
        </Modal>

        <View style={styles.container}>
          <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            data={requests}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
            refreshing={networkStatus === 4}
            onRefresh={() => handleRefresh(refetch)}
            ListEmptyComponent={<Text>You have no private lessons requests!</Text>}
          />
          {/* <View> */}
            <FlatList
              // numColumns={2}
              contentContainerStyle={styles.container}
              data={data}
              keyExtractor={(item, index) => String(index)}
              renderItem={this.renderNothing}
              ListEmptyComponent={<Text>NO DATA</Text>}
              // refreshing={networkStatusCourses === 4 || networkStatusTutors === 4}
              // onRefresh={() => this.refetchData()}
              // ListFooterComponent={this.renderFooter()}
            />
          {/* </View> */}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { tutorId } = user;
  return {
    tutorId,
    user,
  };
};

LessonRequests.defaultProps = {
  tutor: false,
};

const ConnectedComponent = withNavigation(connect(mapStateToProps)(LessonRequests));

const RequestsQuery = ({ tutor }) => {
  if (tutor) {
    return (
      <Query query={GET_TUTOR_PRIVATE_LESSON_REQUESTS} notifyOnNetworkStatusChange>
        {({
          loading, error, data, refetch, networkStatus,
        }) => {
          if (loading && networkStatus !== 4) return (<Spinner color={BLUE} />);
          if (error) return (<Text> Error! {error.message} </Text>);
          return (
            <ConnectedComponent
              requests={data.tutorParticularClassRequests.particularClassRequest}
              refetch={refetch}
              networkStatus={networkStatus}
              tutor={tutor}
            />
          );
        }}
      </Query>
    );
  }
  return (
    <Query query={GET_USER_PRIVATE_LESSON_REQUESTS} notifyOnNetworkStatusChange>
      {({
        loading, error, data, refetch, networkStatus,
      }) => {
        if (loading && networkStatus !== 4) return (<Spinner color={BLUE} />);
        if (error) return (<Text> Error! {error.message} </Text>);
        return (
          <ConnectedComponent
            requests={data.userParticularClassRequests.particularClassRequest}
            refetch={refetch}
            networkStatus={networkStatus}
            tutor={tutor}
          />
        );
      }}
    </Query>
  );
};

RequestsQuery.propTypes = {
  tutor: PropTypes.bool,
};

RequestsQuery.defaultProps = {
  tutor: false,
};

export default RequestsQuery;
