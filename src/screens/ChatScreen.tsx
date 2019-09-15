import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withNavigation } from 'react-navigation';
import Chat from '../components/Chat';
import { ChatHeader } from '../components/ChatUtils';
import BackButton from '../components/BackButton';

const ChatScreen = () => (
  <Chat />
);

ChatScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

ChatScreen.navigationOptions = ({ navigation }) => ({
  headerTitle: <ChatHeader
    name={navigation.getParam('name', '')}
    photo={navigation.getParam('photo', '')}
  />,
  headerLeft: (<BackButton navigation={navigation} />),
});

export default withNavigation(ChatScreen);
