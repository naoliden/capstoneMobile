import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { CHAT_INTERFACE } from 'react-native-dotenv';
import io from 'socket.io-client';
import { ChatListEntry } from './ChatUtils';
import { BLUE } from '../config/colors';
import { logout } from '../actions';

const { height } = Dimensions.get('window');

function createSocket(selfId) {
  const socket = io.connect(CHAT_INTERFACE);
  socket.on('connect', () => {
    socket.emit('room', selfId);
  });
  return socket;
}

class ChatList extends React.Component {
  private constructor(props) {
    super(props);
    const { user } = props;
    this.socket = createSocket(parseInt(user.id, 10));
  }

  private componentDidUpdate = (prevProps) => {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  };

  public render() {
    const {
      navigation,
      chatList,
      networkStatus,
      refetch,
    } = this.props;
    return (
      <View style={{ minHeight: height - 78, marginBottom: 48 }}>
        <ScrollView
          refreshControl={(
            <RefreshControl
              refreshing={networkStatus === 4}
              onRefresh={refetch}
            />
          )}
        >
          { chatList.map(({ user }) => (
            <ChatListEntry
              key={user.id}
              name={user.firstName.concat(' ').concat(user.lastName)}
              photo={user.photo !== null ? user.photo : 'https://bootdey.com/img/Content/avatar/avatar2.png'}
              onPress={() => navigation.navigate('Chat', {
                name: user.firstName.concat(' ').concat(user.lastName),
                photo: user.photo !== null ? user.photo : 'https://bootdey.com/img/Content/avatar/avatar2.png',
                id: user.id,
                socket: this.socket,
              })}
            />
          ))}
        </ScrollView>
      </View>
    );
  }
}

ChatList.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  user: PropTypes.shape({
    photo: PropTypes.string,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  refetch: PropTypes.func.isRequired,
  chatList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
  })).isRequired,
  networkStatus: PropTypes.number.isRequired,
};

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { user, mode } = state.login;
  const { tutorId } = user;
  return {
    currentLanguage,
    user,
    tutorId,
    mode,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchLogOut: () => { dispatch(logout()); },
});

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(ChatList),
);

const GET_CHATS_TUTOR = gql`
  query classReservationsFilterByTutor($tutorId: Int) {
    classReservationsFilterByTutor(input: { tutorId: $tutorId }){
      id
      user{
        id
        firstName
        lastName
        photo
      }
    }
  }
`;

const GET_CHATS_USER = gql`
  query classReservationsFilterByUser($id: Int!) {
    classReservationsFilterByUser(id: $id){
      id
      course{
        id
        name
        tutor{
          id
          user{
            id
            firstName
            lastName
            photo
          }
        }
      }
    }
  }
`;

function parseUserData({ classReservationsFilterByUser }) {
  const seenIds = [];
  const newData = classReservationsFilterByUser.map(({ course }) => {
    const { name, tutor } = course;
    const { user } = tutor;
    if (!seenIds.includes(user.id)) {
      seenIds.push(user.id);
      return { course: name, user };
    }
    return 0;
  });
  return newData.filter(item => item !== 0);
}

function parseTutorData({ classReservationsFilterByTutor }) {
  const seenIds = [];
  const newData = classReservationsFilterByTutor.map((item) => {
    const { user } = item;
    if (!seenIds.includes(user.id)) {
      seenIds.push(user.id);
      return item;
    }
    return 0;
  });
  return newData.filter(item => item !== 0);
}

const ChatListQuery = ({ user, tutorId, mode }) => {
  let query = GET_CHATS_USER;
  let variables = { id: user.id };
  let parse = parseUserData;
  if (tutorId !== null && mode) {
    query = GET_CHATS_TUTOR;
    variables = { tutorId };
    parse = parseTutorData;
  }
  return (
    <Query
      query={query}
      variables={variables}
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
        if (error) return (<Text> Error! {error.message} </Text>);
        return (
          <ComponentWithNavigation
            chatList={parse(data)}
            refetch={refetch}
            networkStatus={networkStatus}
          />
        );
      }}
    </Query>
  );
};

ChatListQuery.propTypes = {
  tutorId: PropTypes.number,
  user: PropTypes.shape({
    photo: PropTypes.string,
  }).isRequired,
  mode: PropTypes.bool,
};

ChatListQuery.defaultProps = {
  tutorId: null,
  mode: false,
};

export default connect(mapStateToProps)(ChatListQuery);
