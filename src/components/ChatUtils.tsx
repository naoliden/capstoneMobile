import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { Text } from 'native-base';
import { Entypo, Ionicons } from '@expo/vector-icons';
import {
  LIGHT_BLUE,
  GRAY,
  LIGHT_GRAY,
  BLUE,
  WHITE,
} from '../config/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'flex-start',
    width: 50,
    height: 50,
    flex: 1,
    borderRadius: 25,
  },
  name: {
    fontSize: 18,
    color: GRAY,
    fontWeight: '500',
    width: '70%',
    marginTop: 15,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    marginLeft: 90,
    width: '100%',
  },
  entryWrapper: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    width,
    flex: 1,
    flexDirection: 'row',
  },
  headerWrapper: {
    width,
    flex: 1,
    flexDirection: 'row',
  },
  headerName: {
    fontSize: 18,
    color: WHITE,
    fontWeight: '500',
    width: '80%',
    marginLeft: 10,
    marginTop: 5,
  },
  headerPhoto: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    marginLeft: 10,
    borderRadius: 18,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  message: {
    flex: 0.8,
    backgroundColor: '#eef3fb',
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: LIGHT_GRAY,
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    elevation: 2,
  },
  myMessage: {
    backgroundColor: LIGHT_BLUE,
  },
  messageTime: {
    color: '#8c8c8c',
    fontSize: 11,
    textAlign: 'right',
  },
  messageSpacer: {
    flex: 0.2,
  },
  container2: {
    alignSelf: 'flex-end',
    backgroundColor: '#f5f1ee',
    borderColor: '#dbdbdb',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 5,
  },
  inputContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#dbdbdb',
    borderRadius: 15,
    borderWidth: 1,
    color: GRAY,
    fontSize: 16,
    height: 35,
    paddingHorizontal: 8,
  },
  sendButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 24,
  },
});

export const ChatListEntry = (props) => {
  const { name, photo, onPress } = props;
  return (
    <View>
      <TouchableHighlight
        underlayColor={LIGHT_GRAY}
        onPress={onPress}
      >
        <View style={styles.entryWrapper}>
          <View style={{ width: '20%' }}>
            <Image
              source={{ uri: photo }}
              style={styles.avatar}
              // resizeMode="cover"
            />
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={{ width: '10%', marginTop: 15 }}>
            <Entypo
              name="chevron-thin-right"
              size={18}
              color={LIGHT_GRAY}
            />
          </View>
        </View>
      </TouchableHighlight>
      <Divider style={styles.divider} />
    </View>
  );
};

ChatListEntry.propTypes = {
  name: PropTypes.string.isRequired,
  photo: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export const ChatHeader = (props) => {
  const { name, photo } = props;
  return (
    <View style={styles.headerWrapper}>
      <View style={{ width: '20%' }}>
        <Image
          source={{ uri: photo }}
          style={styles.headerPhoto}
        />
      </View>
      <Text style={styles.headerName}>{name}</Text>
    </View>
  );
};

ChatHeader.propTypes = {
  name: PropTypes.string.isRequired,
  photo: PropTypes.string.isRequired,
};

export const Message = (props) => {
  const { message, isCurrentUser } = props;
  return (
    <View key={message.id} style={styles.container}>
      {isCurrentUser ? <View style={styles.messageSpacer} /> : undefined }
      <View style={[styles.message, isCurrentUser && styles.myMessage]}>
        <Text style={{ color: GRAY }}>{message.message}</Text>
      </View>
      {!isCurrentUser ? <View style={styles.messageSpacer} /> : undefined }
    </View>
  );
};

Message.propTypes = {
  isCurrentUser: PropTypes.bool.isRequired,
  message: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }).isRequired,
};

export class MessageInput extends React.Component {
  public static propTypes = {
    send: PropTypes.func.isRequired,
  }

  private constructor(props) {
    super(props);
    this.state = { text: '' };
    this.onSend = this.onSend.bind(this);
  }

  private onSend() {
    const { send } = this.props;
    const { text } = this.state;
    if (text !== '') {
      this.textInput.clear();
      send(text);
      this.setState({ text: '' });
    }
  }

  public render() {
    return (
      <View style={styles.container2}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={(ref) => { this.textInput = ref; }}
            onChangeText={word => this.setState({ text: word })}
            style={styles.input}
          />
        </View>
        <TouchableHighlight
          underlayColor={LIGHT_GRAY}
          onPress={this.onSend}
          style={styles.sendButtonContainer}
        >
          <Ionicons name="md-send" size={30} color={BLUE} />
        </TouchableHighlight>
      </View>
    );
  }
}
