import { PartSpec, PersistentPart } from '@/plugins/builder/types';
import { showLinkedWidgetDialog } from '@/plugins/builder/utils';

const DEFAULT_SIZE_X = 1;
const SIZE_Y = 1;

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
        min: 1,
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
    {
      component: 'BorderCard',
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => showLinkedWidgetDialog(part, 'widgetId'),
};

export default spec;
