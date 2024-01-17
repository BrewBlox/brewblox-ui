import { BlockType } from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import {
  makeBeerCoolConfig,
  makeBeerHeatConfig,
  makeFridgeCoolConfig,
  makeFridgeHeatConfig,
} from '../utils';
import widget from './TempControlWidget.vue';
import { TempControlConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<TempControlConfig> = {
      id: 'TempControl',
      title: 'Temp Control Assistant',
      component: cref(app, widget),
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
            id: nanoid(),
            title: 'Beer',
            setpoint: bloxLink(null, BlockType.SetpointSensorPair),
            coolConfig: makeBeerCoolConfig(),
            heatConfig: makeBeerHeatConfig(),
          },
          {
            id: nanoid(),
            title: 'Fridge',
            setpoint: bloxLink(null, BlockType.SetpointSensorPair),
            coolConfig: makeFridgeCoolConfig(),
            heatConfig: makeFridgeHeatConfig(),
          },
        ],
      }),
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
