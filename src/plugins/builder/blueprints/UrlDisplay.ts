import { BuilderBlueprint } from '@/plugins/builder/types';
import { HEIGHT_KEY, LABEL_KEY, URL_KEY, WIDTH_KEY } from '../const';
import { variableSizeFunc } from '../utils';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'UrlDisplay',
  title: 'Label: URL',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: URL_KEY,
        label: 'URL',
      },
    },
    {
      component: 'TextCard',
      props: {
        settingsKey: LABEL_KEY,
        label: 'Displayed text',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: WIDTH_KEY,
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: HEIGHT_KEY,
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 1,
        max: 10,
      },
    },
    {
      component: 'BorderCard',
      props: {},
    },
  ],
  size: variableSizeFunc(DEFAULT_SIZE_X, DEFAULT_SIZE_Y),
  transitions: () => ({}),
};

export default blueprint;
