import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Text,
  FlatList,
} from 'react-native';
import {
  Spinner,
} from 'native-base';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { NotificationsListItem } from './NotificationsList';
import { updateNumber, changeMode } from '../actions';

const GET_NOTIFICATIONS = gql`
query userNotifications($userId: Int) {
  userNotifications(input: {userId: $userId}) {
    userId
    id
    foreignId
    foreignType
    notificationType
    read
    createdAt
    message
  }
}
`;

class Notifications extends React.Component {
  public static propTypes = {
    refetch: PropTypes.func.isRequired,
    networkStatus: PropTypes.number.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    dispatchChangeMode: PropTypes.func.isRequired,
    dispatchNotifications: PropTypes.func.isRequired,
  }

  public constructor(props) {
    super(props);
    this.showNotification = this.showNotification.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  public showNotification(item) {
    const notification = item.item;
    const { navigation, dispatchNotifications, dispatchChangeMode } = this.props;
    const {
      foreignId, notificationType,
      read, createdAt, message,
    } = notification;
    dispatchNotifications(0);
    let backgroundColor: string;
    if (!read) {
      backgroundColor = '#d4e4ff';
    } else {
      backgroundColor = 'white';
    }
    return (
      <NotificationsListItem
        navigation={navigation}
        type={notificationType}
        date={createdAt}
        message={message}
        backgroundColor={backgroundColor}
        reservationId={foreignId}
        dispatchChangeMode={dispatchChangeMode}
      />
    );
  }

  public async handleRefresh() {
    const { refetch } = this.props;
    await refetch();
    this.forceUpdate();
  }

  public render() {
    const { notifications, networkStatus } = this.props;
    return (
      <View>
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => String(index)}
          renderItem={this.showNotification}
          onRefresh={() => this.handleRefresh()}
          refreshing={networkStatus === 4}
          ListEmptyComponent={(
            <Text style={
              { alignSelf: 'center', marginTop: 40 }}
            >
              You do not have any notifications yet
            </Text>
          )}
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

const mapDispatchToProps = dispatch => ({
  dispatchNotifications: (number) => {
    dispatch(updateNumber(number));
  },
  dispatchChangeMode: (mode) => {
    dispatch(changeMode(mode));
  },
});

const ConnectedComponent = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(Notifications),
);


const NotificationsQuery = ({ id }) => {
  const userId = parseInt(id, 10);
  return (
    <Query query={GET_NOTIFICATIONS} variables={{ userId }}>
      {({
        loading,
        error,
        data,
        refetch,
        networkStatus,
      }) => {
        if (loading) return (<Spinner color="#3067BA" />);
        if (error) return (<Text> Oops, Error! {error.message} </Text>);
        return (
          <ConnectedComponent
            notifications={data.userNotifications}
            refetch={refetch}
            networkStatus={networkStatus}
          />
        );
      }}
    </Query>
  );
};

NotificationsQuery.propTypes = {
  id: PropTypes.number.isRequired,
};

export default NotificationsQuery;
