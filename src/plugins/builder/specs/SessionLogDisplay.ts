import { showLinkedWidgetDialog } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 3;
const DEFAULT_SIZE_Y = 5;

const spec: PartSpec = {
  id: 'SessionLogDisplay',
  title: 'Display: Session Log',
  cards: [
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
        min: 2,
        max: 10,
      },
    },
    {
      component: 'LinkedWidgetCard',
      props: {
        settingsKey: 'widgetId',
        types: ['SessionLog'],
      },
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    part.settings.sizeY || DEFAULT_SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showLinkedWidgetDialog(part, 'widgetId'),
};

export default spec;
