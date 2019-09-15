import * as React from 'react';
import * as PropTypes from 'prop-types';
import RNPickerSelect from 'react-native-picker-select';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  Text,
} from 'react-native';
import {
  Divider,
} from 'react-native-elements';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import {
  GREEN,
  GRAY,
  LIGHT_GRAY,
} from '../config/colors';
import { changeMode, changeLanguage } from '../actions';

const styles = StyleSheet.create({
  switch: {
    alignSelf: 'flex-end',
    shadowOffset: { width: 0, height: 0 },
    shadowColor: GRAY,
    shadowOpacity: 0.2,
  },
  bodyContent: {
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10,
    color: GRAY,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    marginLeft: 25,
    marginRight: 25,
    // width: '100%',
  },
  item: {
    width: '50%',
  },
  columnContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
  },
  inputAndroid: {
    borderWidth: 0.3,
    borderRadius: 10,
    borderColor: LIGHT_GRAY,
    marginTop: -10,
  },
  inputIOS: {
    textAlign: 'right',
    alignSelf: 'flex-end',
    fontSize: 18,
    borderColor: LIGHT_GRAY,
  },
  settingsText: {
    color: GRAY,
    fontSize: 18,
  },
});

class SettingsComponent extends React.Component {
  public static propTypes = {
    tutorId: PropTypes.number,
    mode: PropTypes.bool,
    currentLanguage: PropTypes.string.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    dispatchChangeMode: PropTypes.func.isRequired,
    dispatchLanguage: PropTypes.func.isRequired,
  }

  public static defaultProps = {
    tutorId: null,
    mode: false,
  }

  private languages = [
    {
      label: 'Español',
      value: 'es',
    },
    {
      label: 'English',
      value: 'en',
    },
  ];

  private componentDidUpdate(prevProps) {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  }

  private toggleSwitch = (value: boolean) => {
    const { dispatchChangeMode } = this.props;
    // true is tutorMode and false is userMode
    dispatchChangeMode(value);
  }

  public render() {
    const { mode, tutorId } = this.props;

    const placeholder = {
      label: i18n.t('settings.language'),
      value: null,
      color: GRAY,
    };

    return (
      <View>
        <ScrollView>
          <View style={styles.bodyContent}>
            { tutorId !== null && (
              <View style={styles.columnContainer}>
                <View style={styles.item}>
                  <Text style={styles.settingsText}>
                    {i18n.t('settings.tutorMode')}
                  </Text>
                </View>
                <View style={styles.item}>
                  <Switch
                    style={styles.switch}
                    onValueChange={this.toggleSwitch}
                    value={mode}
                    trackColor={{ true: GREEN, false: 'white' }}
                  />
                </View>
              </View>
            )}
            { tutorId !== null && (
              <Divider style={styles.divider} />
            )}
            <View style={styles.columnContainer}>
              <View style={styles.item}>
                <Text style={styles.settingsText}>
                  {i18n.t('settings.selectLanguage')}
                </Text>
              </View>
              <View style={styles.item}>
                <RNPickerSelect
                  style={styles}
                  placeholder={placeholder}
                  items={this.languages}
                  onValueChange={(value) => {
                    i18n.locale = value;
                    const { dispatchLanguage } = this.props;
                    dispatchLanguage(i18n.locale);
                  }}
                />
              </View>
            </View>
            <Divider style={styles.divider} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { user, mode } = state.login;
  const { tutorId } = user;
  return { currentLanguage, tutorId, mode };
};

const mapDispatchToProps = dispatch => ({
  dispatchChangeMode: (mode) => { dispatch(changeMode(mode)); },
  dispatchLanguage: (language) => {
    if (language !== null) {
      dispatch(changeLanguage(language));
    }
  },
});

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(SettingsComponent),
);


export default ComponentWithNavigation;
