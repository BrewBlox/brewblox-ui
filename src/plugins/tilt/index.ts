import { Plugin } from 'vue';

import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { useFeatureStore } from '@/store/features';
import { useServiceStore } from '@/store/services';
import { autoRegister } from '@/utils/component-ref';

import { useTiltStore } from './store';
import TiltWidget from './Tilt';
import { TiltService } from './types';
import { isTiltState } from './utils';

const plugin: Plugin = {
  install(app) {
    const tiltStore = useTiltStore();
    const featureStore = useFeatureStore();
    const serviceStore = useServiceStore();
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

    eventbus.subscribe(`${STATE_TOPIC}/+/+/+`); // service/color/mac
    eventbus.addListener(`${STATE_TOPIC}/+/+/+`, (_, data) => {
      if (isTiltState(data)) {
        serviceStore.ensureStub({ id: data.key, type: 'Tilt' });
        tiltStore.parseStateEvent(data);
      }
    });
  },
};

export default plugin;
