import { uid } from 'quasar';

import { selector } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import { emptyGraphConfig } from '../getters';
import widget from './SessionLogWidget.vue';

const feature: Feature = {
  id: 'SessionLog',
  displayName: 'Session Log',
  widgetComponent: selector(widget),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: () => {
    const sessionId = uid();
    return {
      currentSession: sessionId,
      sessions: [
        {
          id: sessionId,
          title: 'Example session',
          date: new Date().getTime(),
          notes: [
            {
              id: uid(),
              title: 'Example note',
              type: 'Text',
              value: '',
              col: 12,
            },
            {
              id: uid(),
              title: 'Subprocess graph',
              type: 'Graph',
              start: null,
              end: null,
              config: emptyGraphConfig(),
              col: 12,
            },
          ],
        },
      ],
    };
  },
};

export default feature;
