import { Plugin } from 'vue';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { useFeatureStore } from '@/store/features';
import { useServiceStore } from '@/store/services';
import { globRegister } from '@/utils/component-ref';
import { useTiltStore } from './store';
import TiltWidget from './Tilt';
import { TiltService } from './types';
import { isTiltServiceState, isTiltState } from './utils';

const plugin: Plugin = {
  install(app) {
    const tiltStore = useTiltStore();
    const featureStore = useFeatureStore();
    const serviceStore = useServiceStore();
    globRegister(
      app,
      import.meta.glob('./components/**/*.vue', { eager: true }),
    );

    featureStore.addServiceFeature({
      id: 'Tilt',
      title: 'Tilt Service',
      pageComponent: 'TiltPage',
      configComponent: 'TiltActions',
      generate: (stub): TiltService => ({
        ...stub,
        title: stub.id,
        config: {},
      }),
    });

    app.use(TiltWidget);

    eventbus.subscribe(`${STATE_TOPIC}/+`); // service
    eventbus.addListener(`${STATE_TOPIC}/+`, (_, data) => {
      if (isTiltServiceState(data)) {
        serviceStore.ensureStub({ id: data.key, type: 'Tilt' });
      }
    });

    eventbus.subscribe(`${STATE_TOPIC}/+/+/+`); // service/color/mac
    eventbus.addListener(`${STATE_TOPIC}/+/+/+`, (_, data) => {
      if (isTiltState(data)) {
        tiltStore.parseStateEvent(data);
      }
    });
  },
};

export default plugin;
