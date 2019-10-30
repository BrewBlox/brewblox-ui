import { createDialog } from '@/helpers/dialog';
import { dashboardStore } from '@/store/dashboards';

import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 3;
const DEFAULT_SIZE_Y = 5;

const spec: PartSpec = {
  id: 'NotesDisplay',
  title: 'Session Notes',
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
        types: ['SessionNotes'],
      },
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    part.settings.sizeY || DEFAULT_SIZE_Y,
  ],
  transitions: () => ({}),
  interactHandler: (part: PersistentPart) => {
    const { widgetId } = part.settings;
    if (!widgetId) {
      return;
    }
    else if (dashboardStore.widgetIds.includes(widgetId)) {
      createDialog({
        component: 'StoreWidgetDialog',
        mode: 'Basic',
        widgetId,
      });
    }
    else {
      createDialog({
        dark: true,
        title: 'Broken Link',
        message: 'Widget was not found. Use the editor to change the link.',
      });
    }
  },
};

export default spec;
