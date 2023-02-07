import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { prettyConstraints } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { bloxQty, durationString } from '@/utils/quantity';
import {
  ActuatorPwmBlock,
  BlockIntfType,
  BlockType,
  SettingMode,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { emptyAnalogConstraints } from '../../utils/configuration';
import widget from './ActuatorPwmWidget.vue';

const type = BlockType.ActuatorPwm;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<ActuatorPwmBlock> = {
      type,
      generate: (): ActuatorPwmBlock['data'] => ({
        actuatorId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
        period: bloxQty('4s'),
        storedSetting: 0,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constraints: emptyAnalogConstraints(),
        enabled: true,
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
      analyze: (block: ActuatorPwmBlock) => {
        const { enabled, setting, actuatorId } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (actuatorId.id == null) {
          return 'Invalid';
        }
        if (setting == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<ActuatorPwmBlock>[] = [
      {
        type,
        key: 'storedSetting',
        title: 'Stored duty setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
      },
      {
        type,
        key: 'period',
        title: 'Period',
        component: 'DurationValEdit',
        generate: () => bloxQty('4s'),
        pretty: durationString,
      },
      {
        type,
        key: 'enabled',
        title: 'Enabled',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'actuatorId',
        title: 'Target',
        component: 'LinkValEdit',
        generate: () => bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
      },
      {
        type,
        key: 'constraints',
        title: 'Constraints',
        component: 'AnalogConstraintsValEdit',
        generate: () => emptyAnalogConstraints(),
        pretty: prettyConstraints,
      },
      {
        type,
        key: 'desiredSetting',
        title: 'Desired duty setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'setting',
        title: 'Duty setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Duty achieved',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'PWM',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
