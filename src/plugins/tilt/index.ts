import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { STATE_TOPIC } from '@/helpers/const';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';

import { isTiltState } from './helpers';
import { tiltStore } from './store';
import TiltWidget from './Tilt';
import { TiltService } from './types';

export default {
  install(Vue: VueConstructor) {

    autoRegister(require.context('./components', true));

    featureStore.registerService({
      id: 'Tilt',
      title: 'Tilt Service',
      pageComponent: 'TiltPage',
      configComponent: 'TiltActions',
      wizard: (stub): TiltService => ({
        ...stub,
        title: stub.id,
        order: 0,
        config: {
          tempUnit: 'degC',
        },
      }),
    });

    featureStore.registerWidget(TiltWidget);

    Vue.$eventbus.subscribe(`${STATE_TOPIC}/+/+`); // id/colour
    Vue.$eventbus.addListener(`${STATE_TOPIC}/+/+`, (_, data) => {
      if (isTiltState(data)) {
        serviceStore.ensureStub({ id: data.key, type: 'Tilt' });
        tiltStore.parseStateEvent(data);
      }
    });
  },
};
