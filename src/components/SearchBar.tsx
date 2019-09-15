import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import {
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import {
  addWord,
  changeSwitch,
  changePlaceholder,
  saveTutors,
  changeLanguage,
} from '../actions';
import { BLUE, GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
    elevation: 1,
    marginTop: 30,
    marginBottom: 10,
  },
  textBar: {
    flex: 1,
    fontWeight: '300',
    backgroundColor: 'white',
  },
  iconStyle: {
    marginRight: 10,
    marginLeft: 3,
    marginTop: 3,
    color: GRAY,
  },
});

class SearchBar extends React.Component {
  public static propTypes = {
    text: PropTypes.string.isRequired,
    placeholderText: PropTypes.string.isRequired,
    switchValue: PropTypes.bool.isRequired,
    allTutors: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatchAddWord: PropTypes.func.isRequired,
    dispatchChangePlaceholder: PropTypes.func.isRequired,
    dispatchChangeSwitch: PropTypes.func.isRequired,
    dispatchSaveTutors: PropTypes.func.isRequired,
    currentLanguage: PropTypes.string.isRequired,
  }

  public constructor(props) {
    super(props);
    this.state = {
      titleButton: i18n.t('searchBar.exploreTutor'),
      color: 'white',
      textColor: BLUE,
    };
    this.toggleSwitch = this.toggleSwitch.bind(this);
  }

  private componentDidMount() {
    const {
      dispatchChangeSwitch,
      dispatchChangePlaceholder,
      dispatchAddWord,
    } = this.props;
    dispatchChangeSwitch(false);
    dispatchChangePlaceholder(i18n.t('searchBar.searchCourse'));
    dispatchAddWord('');
  }

  private componentWillReceiveProps(nextProps) {
    const { currentLanguage, switchValue } = this.props;
    if (currentLanguage !== nextProps.currentLanguage) {
      if (switchValue) {
        this.setState({
          titleButton: i18n.t('searchBar.exploreCourses'),
        });
      } else {
        this.setState({
          titleButton: i18n.t('searchBar.exploreTutor'),
        });
      }
    }
  }

  private componentDidUpdate(prevProps: {}) {
    const {
      text, switchValue, currentLanguage, dispatchChangePlaceholder,
    } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      if (switchValue) {
        dispatchChangePlaceholder(i18n.t('searchBar.searchTutor'));
      } else {
        dispatchChangePlaceholder(i18n.t('searchBar.searchCourse'));
      }
      this.forceUpdate();
    }
    if ((text !== prevProps.text) && switchValue) {
      const { allTutors, dispatchSaveTutors } = this.props;
      const result = allTutors.filter(this.filterTutorsBySearch);
      dispatchSaveTutors(result);
    }
  }

  private filterTutorsBySearch = (item: {}) => {
    const { text } = this.props;
    const { firstName, lastName } = item.user;
    const names = [firstName.toLowerCase(), lastName.toLowerCase()];
    let answer = false;
    names.forEach((word: string) => {
      if (word.search(text.toLowerCase()) === 0) {
        answer = true;
      }
    });
    return answer;
  }

  private onChange = (text: string) => {
    const { dispatchAddWord } = this.props;
    dispatchAddWord(text);
  }


  private toggleSwitch = () => {
    const { dispatchChangeSwitch, dispatchChangePlaceholder, switchValue } = this.props;
    const newValue = !switchValue;
    dispatchChangeSwitch(newValue);
    if (newValue) {
      this.setState({
        titleButton: i18n.t('searchBar.exploreCourses'),
        color: BLUE,
        textColor: 'white',
      });
      dispatchChangePlaceholder(i18n.t('searchBar.searchTutor'));
    } else {
      this.setState({
        titleButton: i18n.t('searchBar.exploreTutor'),
        color: 'white',
        textColor: BLUE,
      });
      dispatchChangePlaceholder(i18n.t('searchBar.searchCourse'));
    }
  }

  public render() {
    const { text, placeholderText } = this.props;
    const { titleButton, color, textColor } = this.state;
    return (
      <View style={styles.container}>
        <Ionicons
          name="ios-search"
          size={25}
          style={styles.iconStyle}
        />
        <TextInput
          style={styles.textBar}
          underlineColorAndroid="transparent"
          placeholder={placeholderText}
          placeholderTextColor="grey"
          onChangeText={this.onChange}
          value={text}
        />
        <Button
          containerStyle={{ paddingRight: 3 }}
          titleStyle={{ fontSize: 10, color: textColor }}
          buttonStyle={{ height: 30, borderColor: BLUE, backgroundColor: color }}
          title={titleButton}
          type="outline"
          onPress={this.toggleSwitch}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: {}) => {
  const { currentLanguage } = state.langs;
  const { placeholderText, text, switchValue } = state.searchBar;
  const {
    allCourses,
    courses,
    allTutors,
    tutors,
  } = state.courses;
  return {
    currentLanguage,
    placeholderText,
    text,
    switchValue,
    courses,
    allCourses,
    tutors,
    allTutors,
  };
};

const mapDispatchToProps = {
  dispatchAddWord: addWord,
  dispatchChangeSwitch: changeSwitch,
  dispatchChangePlaceholder: changePlaceholder,
  dispatchSaveTutors: saveTutors,
  dispatchLanguage: changeLanguage,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
