import { uid } from 'quasar';

import { bloxLink } from '@/helpers/bloxfield';
import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { makeBeerCoolConfig, makeBeerHeatConfig, makeFridgeCoolConfig, makeFridgeHeatConfig } from '../Ferment/helpers';
import widget from './TempControlWidget.vue';
import { TempControlConfig } from './types';

const feature: WidgetFeature<TempControlConfig> = {
  id: 'TempControl',
  title: 'Temperature Control',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  generateConfig: () => ({
    serviceId: null,
    coolPid: bloxLink(null),
    heatPid: bloxLink(null),
    profile: bloxLink(null),
    activeMode: 'beer',
    modes: [
      {
        id: uid(),
        title: 'beer',
        setpoint: bloxLink(null),
        coolConfig: makeBeerCoolConfig(),
        heatConfig: makeBeerHeatConfig(),
      },
      {
        id: uid(),
        title: 'fridge',
        setpoint: bloxLink(null),
        coolConfig: makeFridgeCoolConfig(),
        heatConfig: makeFridgeHeatConfig(),
      },
    ],
  }),
};

export default feature;
