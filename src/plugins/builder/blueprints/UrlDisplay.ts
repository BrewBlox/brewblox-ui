import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 1;

const blueprint: BuilderBlueprint = {
  type: 'UrlDisplay',
  title: 'Label: URL',
  cards: [
    {
      component: 'TextCard',
      props: {
        settingsKey: 'url',
        label: 'URL',
      },
    },
    {
      component: 'TextCard',
      props: {
        settingsKey: 'text',
        label: 'Displayed text',
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 1,
        max: 10,
      },
    },
    {
      component: 'BorderCard',
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    part.settings.sizeY || DEFAULT_SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart, { navigate }) => {
    const { url } = part.settings;
    if (url) {
      navigate(url);
    }
  },
};

export default blueprint;
