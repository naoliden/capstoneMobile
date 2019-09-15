import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Alert,
  Text,
  ScrollView,
} from 'react-native';
import { Spinner } from 'native-base';
import { connect } from 'react-redux';
import { Button, Overlay, CheckBox } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import gql from 'graphql-tag';
import { Query, compose, withApollo } from 'react-apollo';
import i18n from 'i18n-js';
import { BLUE } from '../config/colors';
import { saveCourses, addWord, changeLanguage } from '../actions';

const _ = require('lodash');

const FILTER_COURSES = gql`
  query filterCourses($name: String, $maxPrice: Float, $minPrice: Float, $labels: [Int]) {
    filterCourses(input: { name: $name, maxPrice: $maxPrice, minPrice: $minPrice, labels: $labels, active: 1}) {
      id
      name
      price
      description
      address
      gradeAverage
      images{
        courseId
        url
      }
      labelIndex{
        category
        id
      }
    }
  }
`;

const FILTER_COURSES_NO_NAME = gql`
  query filterCourses($maxPrice: Float, $minPrice: Float, $labels: [Int]) {
    filterCourses(input: {maxPrice: $maxPrice, minPrice: $minPrice, labels: $labels, active: 1}) {
      id
      name
      price
      description
      address
      gradeAverage
      images{
        courseId
        url
      }
      labelIndex{
        category
        id
      }
    }
  }
`;

const styles = StyleSheet.create({
  container: {
    paddingLeft: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  overlayPrice: {
    paddingTop: 20,
    height: 250,
    width: 300,
    alignSelf: 'center',
    marginTop: 50,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 10,
  },
  overlayCategory: {
    padding: 20,
    height: 500,
    width: 300,
    alignSelf: 'center',
    marginTop: 50,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'black',
    shadowOpacity: 0.2,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 10,
  },
  title: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  priceRangeContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: BLUE,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
});

class CourseFilters extends React.Component {
  public static navigationOptions = {
    header: null,
  }

  public static propTypes = {
    currentLanguage: PropTypes.string.isRequired,
    allCourses: PropTypes.arrayOf(PropTypes.shape({
      price: PropTypes.number.isRequired,
    })).isRequired,
    showLabels: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatchSaveCourses: PropTypes.func.isRequired,
    dispatchAddWord: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    switchValue: PropTypes.bool.isRequired,
    client: PropTypes.shape({
      query: PropTypes.func.isRequired,
    }).isRequired,
  }

  public constructor(props) {
    super(props);
    const { allCourses } = this.props;
    const minPrice = _.minBy(allCourses, 'price').price;
    const maxPrice = _.maxBy(allCourses, 'price').price;
    this.state = {
      priceVisible: false,
      categoryVisible: false,
      multiSliderValue: [minPrice, maxPrice],
      minPrice,
      maxPrice,
      checked: this.createCheckedLabels(),
      colorPrice: '#fff',
      colorCategory: '#fff',
      textColorPrice: BLUE,
      textColorCategory: BLUE,
    };
  }

  public componentDidMount() {
    const { dispatchAddWord } = this.props;
    dispatchAddWord('');
  }

  public componentDidUpdate(prevProps: {}) {
    const { text, switchValue, currentLanguage } = this.props;
    if ((text !== prevProps.text) && !switchValue) {
      this.updateList();
    }
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  }

  public componentWillUnmount() {
    // ver si funciona bien, yendo a explorar tutores y devolviendose
    const {
      allCourses,
      dispatchSaveCourses,
      dispatchAddWord,
    } = this.props;
    dispatchAddWord('');
    dispatchSaveCourses(allCourses);
    this.clearAll();
  }

  private onPressPriceHandler(price: boolean) {
    const { multiSliderValue, minPrice, maxPrice } = this.state;
    if (multiSliderValue[0] !== minPrice || multiSliderValue[1] !== maxPrice) {
      this.setState({ colorPrice: BLUE, textColorPrice: '#fff' });
    } else {
      this.setState({ colorPrice: '#fff', textColorPrice: BLUE });
    }
    this.setPriceOverlayVisible(!price);
    this.updateList();
  }

  private onPressCategoryHandler(category: boolean) {
    const { checked } = this.state;
    if (Object.values(checked).includes(true)) {
      this.setState({ colorCategory: BLUE, textColorCategory: '#fff' });
    } else {
      this.setState({ colorCategory: '#fff', textColorCategory: BLUE });
    }
    this.setCategoryOverlayVisible(!category);
    this.updateList();
  }

  private setPriceOverlayVisible(visible: boolean) {
    this.setState({ priceVisible: visible });
  }

  private setCategoryOverlayVisible(visible: boolean) {
    this.setState({ categoryVisible: visible });
  }

  private filterCoursesByPrice = () => {
    const { multiSliderValue } = this.state;
    const min = multiSliderValue[0];
    const max = multiSliderValue[1];
    return [min, max];
  }

  private filterCoursesByCategory = () => {
    const { checked } = this.state;
    const { showLabels } = this.props;
    const currentlyChecked = [];
    for (let i = 0; i < Object.keys(checked).length; i += 1) {
      if (Object.values(checked)[i]) {
        currentlyChecked.push(parseInt(showLabels[i].id, 10));
      }
    }
    return currentlyChecked;
  }

  private multiSliderValuesChange = (values: []) => {
    this.setState({
      multiSliderValue: values,
    });
  };

  private createCheckedLabels() {
    const { showLabels } = this.props;
    const checkedLabels = {};
    for (let i = 0; i < showLabels.length; i += 1) {
      checkedLabels[showLabels[i].category] = false;
    }
    return checkedLabels;
  }

  public checkboxPressHandler(label: string) {
    const { checked } = this.state;
    const newChecked = checked;
    newChecked[label] = !checked[label];
    this.setState({ checked: newChecked });
  }

  public checkAll() {
    const { checked } = this.state;
    const newChecked = checked;
    for (let i = 0; i < Object.keys(checked).length; i += 1) {
      newChecked[Object.keys(checked)[i]] = true;
    }
    this.setState({ checked: newChecked });
  }

  public clearAll() {
    const { checked } = this.state;
    const newChecked = checked;
    for (let i = 0; i < Object.keys(checked).length; i += 1) {
      newChecked[Object.keys(checked)[i]] = false;
    }
    this.setState({ checked: newChecked });
  }

  private async updateList() {
    const {
      dispatchSaveCourses,
      text,
      client,
    } = this.props;
    const labels = this.filterCoursesByCategory();
    const prices = this.filterCoursesByPrice();
    let result;
    if (text !== '') {
      result = await client.query({
        query: FILTER_COURSES,
        variables: {
          name: text,
          minPrice: parseFloat(prices[0]),
          maxPrice: parseFloat(prices[1]),
          labels,
        },
      });
    } else {
      result = await client.query({
        query: FILTER_COURSES_NO_NAME,
        variables: {
          minPrice: parseFloat(prices[0]),
          maxPrice: parseFloat(prices[1]),
          labels,
        },
      });
    }
    const { filterCourses } = result.data;
    dispatchSaveCourses(filterCourses);
  }

  public render() {
    const {
      priceVisible,
      categoryVisible,
      multiSliderValue,
      minPrice,
      maxPrice,
      checked,
      colorCategory,
      colorPrice,
      textColorCategory,
      textColorPrice,
    } = this.state;
    return (
      <View style={styles.container}>
        <Overlay
          overlayStyle={styles.overlayPrice}
          animationType="fade"
          isVisible={priceVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
        >
          <View style={styles.priceRangeContainer}>
            <Text style={styles.title}>{i18n.t('courseFilters.priceRange')}</Text>
            <Text style={{ fontSize: 18 }}>${multiSliderValue[0]} - ${multiSliderValue[1]} </Text>
            <View style={{ marginLeft: 15, marginRight: 15 }}>
              <MultiSlider
                values={[
                  multiSliderValue[0],
                  multiSliderValue[1],
                ]}
                sliderLength={260}
                onValuesChange={this.multiSliderValuesChange}
                min={minPrice}
                max={maxPrice}
                step={1}
                allowOverlap={false}
                snapped
                minMarkerOverlapDistance={40}
                // customMarker={CustomMarker}
              />
            </View>
            <Button
              title={i18n.t('buttons.filter')}
              onPress={() => {
                this.onPressPriceHandler(priceVisible);
              }}
              buttonStyle={styles.button}
            />
            <Button
              title={i18n.t('courseFilters.clearAll')}
              type="clear"
              titleStyle={{ color: BLUE, fontSize: 14 }}
              onPress={() => {
                this.setState({
                  multiSliderValue: [minPrice, maxPrice],
                });
              }}
            />
          </View>
        </Overlay>

        <Overlay
          overlayStyle={styles.overlayCategory}
          animationType="fade"
          isVisible={categoryVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
        >
          <View style={styles.priceRangeContainer}>
            <Text style={styles.title}>{i18n.t('courseFilters.categories')}</Text>
            <ScrollView>
              {Object.keys(checked).map(label => (
                <CheckBox
                  key={label}
                  checkedIcon={<MaterialIcons name="check-box" size={20} color={BLUE} />}
                  uncheckedIcon={<MaterialIcons name="check-box-outline-blank" size={20} color={BLUE} />}
                  title={label}
                  checked={checked[label]}
                  size={15}
                  textStyle={{ fontSize: 16, fontWeight: '400' }}
                  onPress={() => this.checkboxPressHandler(label)}
                />
              ))}
            </ScrollView>
            <Button
              title={i18n.t('buttons.filter')}
              onPress={() => {
                this.onPressCategoryHandler(categoryVisible);
              }}
              buttonStyle={styles.button}
            />
            <Button
              title={i18n.t('courseFilters.clearAll')}
              type="clear"
              titleStyle={{ color: BLUE, fontSize: 14 }}
              onPress={() => { this.clearAll(); }}
            />
          </View>
        </Overlay>

        <View style={styles.buttonsContainer}>
          <Button
            containerStyle={{ paddingRight: 3 }}
            titleStyle={{ fontSize: 10, color: textColorPrice }}
            buttonStyle={{ height: 31, borderColor: BLUE, backgroundColor: colorPrice }}
            title={i18n.t('courseFilters.price')}
            type="outline"
            onPress={() => {
              this.setPriceOverlayVisible(true);
            }}
          />
          <Button
            containerStyle={{ paddingLeft: 3 }}
            titleStyle={{ fontSize: 10, color: textColorCategory }}
            buttonStyle={{ height: 31, borderColor: BLUE, backgroundColor: colorCategory }}
            title={i18n.t('courseFilters.category')}
            type="outline"
            onPress={() => {
              this.setCategoryOverlayVisible(true);
            }}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: {}) => {
  const { text, switchValue } = state.searchBar;
  const { currentLanguage } = state.langs;
  const {
    allCourses,
    courses,
  } = state.courses;
  return {
    currentLanguage,
    courses,
    allCourses,
    text,
    switchValue,
  };
};

const mapDispatchToProps = {
  dispatchSaveCourses: saveCourses,
  dispatchAddWord: addWord,
  dispatchLanguage: changeLanguage,
};

const GET_LABELS = gql`
  {
    showLabels {
      id
      category
    }
  }
`;

const ConnectedComponent = compose(
  withApollo,
  connect(mapStateToProps, mapDispatchToProps),
)(CourseFilters);

const LabelsQuery = () => (
  <Query query={GET_LABELS}>
    {({
      loading,
      error,
      data,
    }) => {
      if (loading) return (<Spinner color={BLUE} />);
      if (error) return (<Text> Error! {error.message} </Text>);
      return (
        <ConnectedComponent
          showLabels={data.showLabels}
        />
      );
    }}
  </Query>
);

export default LabelsQuery;
