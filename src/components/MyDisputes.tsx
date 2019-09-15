import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Spinner,
} from 'native-base';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import i18n from 'i18n-js';
import { BLUE, GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    margin: 12,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listTitle: {
    fontSize: 30,
    color: GRAY,
    fontWeight: '500',
    padding: 8,
  },
  name: {
    fontWeight: '500',
    fontSize: 20,
    padding: 10,
    color: GRAY,
  },
  date: {
    fontSize: 10,
    color: GRAY,
    fontWeight: '300',
    paddingLeft: 10,
    paddingBottom: 10,
  },
  comment: {
    color: GRAY,
    fontSize: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
});

function showStatus(item: {}) {
  if (item.status !== 'WAITING') {
    return (
      <Text style={styles.comment}>{i18n.t('myDisputes.answer')}: {item.answer}</Text>
    );
  }
  return (
    <View />
  );
}

class MyDisputes extends React.Component {
  public static propTypes = {
    disputes: PropTypes.arrayOf(PropTypes.object),
    refetch: PropTypes.func.isRequired,
    networkStatus: PropTypes.number.isRequired,
    mode: PropTypes.bool.isRequired,
  }

  public static defaultProps = {
    disputes: [],
  }

  private constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }

  private keyExtractor = (item: object) => String(item.id)

  private renderItem({ item }) {
    const { mode } = this.props;
    const {
      classReservation,
      comment,
      status,
      createdAt,
    } = item;
    const { course, user } = classReservation;
    const { tutor, name } = course;
    const { firstName: userFirstName, lastName: userLastName } = user;
    const { user: tutorUser } = tutor;
    const { firstName: tutorFirstName, lastName: tutorLastName } = tutorUser;
    if (!mode) {
      return (
        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.date}>{createdAt}</Text>
          <Text style={styles.comment}>Tutor: {tutorFirstName} {tutorLastName}</Text>
          <Text style={styles.comment}>{i18n.t('myDisputes.comment')}: {comment}</Text>
          <Text style={styles.comment}>{i18n.t('myDisputes.status')}: {status}</Text>
          {showStatus(item)}
        </View>
      );
    }
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{createdAt}</Text>
        <Text style={styles.comment}>{i18n.t('myDisputes.user')}: {userFirstName} {userLastName}</Text>
        <Text style={styles.comment}>{i18n.t('myDisputes.comment')}: {comment}</Text>
        <Text style={styles.comment}>{i18n.t('myDisputes.status')}: {status}</Text>
        {showStatus(item)}
      </View>
    );
  }

  public render() {
    const { disputes, refetch, networkStatus } = this.props;
    return (
      <View>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={disputes}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          refreshing={networkStatus === 4}
          onRefresh={() => refetch()}
          ListEmptyComponent={<Text>{i18n.t('myDisputes.empty')}</Text>}
        />
      </View>
    );
  }
}


const mapStateToProps = (state: object) => {
  const { user, mode } = state.login;
  const { tutorId } = user;
  return {
    tutorId,
    mode,
    user,
  };
};

const ConnectedComponent = connect(mapStateToProps, null)(MyDisputes);

const GET_DIPUTES_USER = gql`
query refoundRequests($userId: ID) {
    refoundRequests(input: {userId: $userId}) {
        id
        transactionId
        comment
        answer
        status
        createdAt
        classReservation{
            id
            user{
              id
              firstName
              lastName
            }
            course{
                id
                name
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
        }
  }
}
`;

const GET_DIPUTES_TUTOR = gql`
query refoundRequests($tutorId: ID) {
    refoundRequests(input: {tutorId: $tutorId}) {
        id
        transactionId
        comment
        answer
        status
        createdAt
        classReservation{
            id
            user{
              id
              firstName
              lastName
            }
            course{
                id
                name
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
        }
  }
}
`;

const MyDisputesQuery = ({ mode, id }) => {
  if (mode) {
    const tutorId = id;
    return (
      <Query query={GET_DIPUTES_TUTOR} variables={{ tutorId }}>
        {({
          loading, error, data, refetch, networkStatus,
        }) => {
          if (loading) return (<Spinner color={BLUE} />);
          if (error) return (<Text> Error! {error.message} </Text>);
          return (
            <ConnectedComponent
              disputes={data.refoundRequests}
              refetch={refetch}
              networkStatus={networkStatus}
            />
          );
        }}
      </Query>
    );
  }
  const userId = id;
  return (
    <Query query={GET_DIPUTES_USER} variables={{ userId }}>
      {({
        loading, error, data, refetch, networkStatus,
      }) => {
        if (loading) return (<Spinner color={BLUE} />);
        if (error) return (<Text> Error! {error.message} </Text>);
        return (
          <ConnectedComponent
            disputes={data.refoundRequests}
            refetch={refetch}
            networkStatus={networkStatus}
          />
        );
      }}
    </Query>
  );
};

MyDisputesQuery.propTypes = {
  id: PropTypes.number.isRequired,
  mode: PropTypes.bool.isRequired,
};

export default MyDisputesQuery;
