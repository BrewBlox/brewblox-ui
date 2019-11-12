import { showLinkedWidgetDialog } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const SIZE_X = 1;
const SIZE_Y = 1;

const spec: PartSpec = {
  id: 'SessionLogDisplay',
  title: 'Display: Session Log',
  cards: [
    {
      component: 'LinkedWidgetCard',
      props: {
        settingsKey: 'widgetId',
        types: ['SessionLog'],
      },
    },
  ],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showLinkedWidgetDialog(part, 'widgetId'),
};

export default spec;
