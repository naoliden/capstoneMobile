import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { CHAT_INTERFACE } from 'react-native-dotenv';
import { Message, MessageInput } from './ChatUtils';
import { logout } from '../actions';
import {
  BLUE,
} from '../config/colors';

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
  },
});

class Chat extends React.Component {
  private constructor(props) {
    super(props);
    const { navigation } = props;
    this.state = { currentId: 1, messages: [], keyboardAvoidingViewKey: 'keyboardAvoidingViewKey' };
    this.onMessage = this.onMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.nextId = this.nextId.bind(this);
    this.getOldMessages = this.getOldMessages.bind(this);
    this.socket = navigation.getParam('socket').on('message', this.onMessage);
    this.keyboardHideListener = this.keyboardHideListener.bind(this);
    this.getOldMessages();
  }

  public componentDidMount() {
    this.keyboardHideListener = Keyboard.addListener(Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide', this.keyboardHideListener.bind(this));
  }

  public componentWillUnmount() {
    this.keyboardHideListener.remove();
  }

  private onMessage(msg) {
    const { messages } = this.state;
    this.setState({
      messages: messages.concat([{ ...msg, id: this.nextId() }]),
    });
  }

  private async getOldMessages() {
    const { user, navigation } = this.props;
    const response = await fetch(CHAT_INTERFACE.concat('/messages'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: user.token,
        PEER: navigation.getParam('id', ''),
      },
    });
    const data = await response.json();
    this.setState({ messages: data });
  }

  public componentDidUpdate = (prevProps) => {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  };

  public renderItem = ({ item }) => {
    const { user } = this.props;
    return (
      <Message
        isCurrentUser={parseInt(item.from, 10) === parseInt(user.id, 10)}
        message={item}
      />
    );
  }

  public keyExtractor = item => item.id.toString();

  public keyboardHideListener() {
    this.setState({
      keyboardAvoidingViewKey: `keyboardAvoidingViewKey${new Date().getTime()}`,
    });
  }

  private sendMessage(text: string) {
    const { navigation, user } = this.props;
    this.socket.emit('message', {
      authorization: user.token,
      to: parseInt(navigation.getParam('id', ''), 10),
      message: text,
    });
    this.onMessage({ message: text, from: user.id, id: this.nextId() });
  }

  private nextId() {
    const { currentId } = this.state;
    const newId = currentId + 1;
    this.setState({ currentId: newId });
    return newId;
  }

  public render() {
    const { messages, keyboardAvoidingViewKey } = this.state;
    if (!messages) {
      return (
        <Spinner color={BLUE} />
      );
    }
    const key = keyboardAvoidingViewKey + messages.id;
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'height' : null}
        contentContainerStyle={styles.container}
        keyboardVerticalOffset={64}
        style={styles.container}
        key={key}
      >
        <FlatList
          inverted
          data={messages.slice().reverse()}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListEmptyComponent={<View />}
          // onEndReached={this.onEndReached}
        />
        <MessageInput send={this.sendMessage} />
      </KeyboardAvoidingView>
    );
  }
}

Chat.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  user: PropTypes.shape({
    photo: PropTypes.string,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { user } = state.login;
  return { currentLanguage, user };
};

const mapDispatchToProps = dispatch => ({
  dispatchLogOut: () => { dispatch(logout()); },
});

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(Chat),
);

export default ComponentWithNavigation;
