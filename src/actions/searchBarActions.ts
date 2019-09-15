import {
  WRITE,
  SWITCH,
  PLACEHOLDER,
} from './types';

const addWord = (text: string) => (
  {
    type: WRITE,
    payload: text,
  }
);

const changeSwitch = (value: boolean) => (
  {
    type: SWITCH,
    payload: value,
  }
);

const changePlaceholder = (text: string) => (
  {
    type: PLACEHOLDER,
    payload: text,
  }
);

export {
  addWord,
  changeSwitch,
  changePlaceholder,
};
