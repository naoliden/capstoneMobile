import * as React from 'react';
import i18n from 'i18n-js';
import ChatList from '../components/ChatList';

const ChatListScreen = () => (
  <ChatList />
);


ChatListScreen.navigationOptions = () => ({
  title: i18n.t('chat.title'),
});


export default ChatListScreen;
