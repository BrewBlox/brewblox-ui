import { uid } from 'quasar';

import { bloxLink } from '@/helpers/bloxfield';
import { ref } from '@/helpers/component-ref';
import { BlockType } from '@/shared-types';
import { WidgetFeature } from '@/store/features';

import { makeBeerCoolConfig, makeBeerHeatConfig, makeFridgeCoolConfig, makeFridgeHeatConfig } from '../Ferment/helpers';
import widget from './TempControlWidget.vue';
import { TempControlConfig } from './types';

const feature: WidgetFeature<TempControlConfig> = {
  id: 'TempControl',
  title: 'Temp Control Assistant',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  generateConfig: () => ({
    serviceId: null,
    coolPid: bloxLink(null, BlockType.Pid),
    heatPid: bloxLink(null, BlockType.Pid),
    profile: bloxLink(null, BlockType.SetpointProfile),
    activeMode: null,
    modes: [
      {
        id: uid(),
        title: 'Beer',
        setpoint: bloxLink(null, BlockType.SetpointSensorPair),
        coolConfig: makeBeerCoolConfig(),
        heatConfig: makeBeerHeatConfig(),
      },
      {
        id: uid(),
        title: 'Fridge',
        setpoint: bloxLink(null, BlockType.SetpointSensorPair),
        coolConfig: makeFridgeCoolConfig(),
        heatConfig: makeFridgeHeatConfig(),
      },
    ],
  }),
};

export default feature;
