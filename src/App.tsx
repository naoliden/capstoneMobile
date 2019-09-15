/* eslint no-underscore-dangle: ["error", {"allow": ["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] }] */
import * as React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { Spinner } from 'native-base';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'; //lógica asincrona para usar el control de estado de redux (antes era solo sincrono)
import { persistStore, persistReducer } from 'redux-persist'; //para mantener el estado de la store en el local storage del browser
import { Localization } from 'expo';
import { Notifications } from 'expo';
import i18n from 'i18n-js';
import { PersistGate } from 'redux-persist/lib/integration/react'; //deplega la app solo cuando el estado guardado de redux ha sido obtenido
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { NETWORK_INTERFACE } from 'react-native-dotenv';
import AppNavigator from './navigation/AppNavigator';
import rootReducer from './reducers';
import en from './languages/en.json';
import es from './languages/es.json';
import { updateNumber } from './actions';
import { BLUE } from './config/colors';

i18n.fallbacks = true;
i18n.translations = { en, es };
i18n.locale = Localization.locale;

const middleware = [thunkMiddleware];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistConfig = { //root cosa de que siempre mantenga la misma configuracións
  key: 'root',
  stateReconciler: autoMergeLevel2, // cuando la app se lanza, redux tiene un estado inicial, que luego mezcla con el guardado
  storage,
};

const pReducer = persistReducer(persistConfig, rootReducer); //configuración recien creada + los reducers combinados
const store = createStore(
  pReducer,
  composeEnhancers(applyMiddleware(...middleware)),
);

// The most common use case for middleware is to support asynchronous actions without much boilerplate code or a dependency on a library like Rx. It does so by letting you dispatch async actions in addition to normal actions.
const persistor = persistStore(store);



const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const { token } = store.getState().login.user;
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : '',
    },
  };
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(createUploadLink({ uri: NETWORK_INTERFACE })),
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

class App extends React.Component {
  public constructor(props) {
    super(props);
    this.store = store;
    this.state = {
      notification: {},
    };
    this.showNotification = this.showNotification.bind(this);
  }

  public componentWillMount() {
    this.store = store;
  }

  public componentDidMount() {
    this._notificationSubscription = Notifications.addListener(this.handleNotification);
  }

  private handleNotification = (notification) => {
    this.setState({ notification });
    const { number } = this.store.getState().notifications;
    const newNumber = number + 1;
    this.store.dispatch(updateNumber(newNumber));
    this.showNotification();
  };

  public showNotification() {
    const { notification } = this.state;
    const { title, body } = notification.data;
    showMessage({
      message: title,
      description: body,
      type: 'default',
    });
  }

  public render() {
    return (
      <ApolloProvider client={apolloClient}>
        <Provider store={this.store}>
          <PersistGate loading={<Spinner color={BLUE} />} persistor={persistor}>
            <View style={styles.container}>
              {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              <AppNavigator />
              <FlashMessage position="top" />
            </View>
          </PersistGate>
        </Provider>
      </ApolloProvider>
    );
  }
}

export default App;
