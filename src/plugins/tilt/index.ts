import { Plugin } from 'vue';

import { eventbus } from '@/eventbus';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';
import { autoRegister } from '@/utils/component-ref';
import { STATE_TOPIC } from '@/utils/const';

import { tiltStore } from './store';
import TiltWidget from './Tilt';
import { TiltService } from './types';
import { isTiltState } from './utils';

const plugin: Plugin = {
  install(app) {
    autoRegister(app, require.context('./components', true));

    featureStore.addServiceFeature({
      id: 'Tilt',
      title: 'Tilt Service',
      pageComponent: 'TiltPage',
      configComponent: 'TiltActions',
      wizard: (stub): TiltService => ({
        ...stub,
        title: stub.id,
        order: 0,
        config: {},
      }),
    });

    app.use(TiltWidget);

    eventbus.subscribe(`${STATE_TOPIC}/+/+`); // id/colour
    eventbus.addListener(`${STATE_TOPIC}/+/+`, (_, data) => {
      if (isTiltState(data)) {
        serviceStore.ensureStub({ id: data.key, type: 'Tilt' });
        tiltStore.parseStateEvent(data);
      }
    });
  },
};

export default plugin;
