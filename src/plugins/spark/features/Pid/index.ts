import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import {
  bloxQty,
  deltaTempQty,
  durationString,
  inverseTempQty,
  tempQty,
} from '@/utils/quantity';
import {
  BlockIntfType,
  BlockType,
  FilterChoice,
  PidBlock,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './PidWidget.vue';

const type = BlockType.Pid;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<PidBlock> = {
      type,
      generate: (): PidBlock['data'] => ({
        inputId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        outputId: bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
        inputValue: tempQty(0),
        inputSetting: tempQty(0),
        outputValue: 0,
        outputSetting: 0,
        enabled: false,
        active: true,
        kp: inverseTempQty(20),
        ti: bloxQty('2h'),
        td: bloxQty('0s'),
        p: 0,
        i: 0,
        d: 0,
        error: deltaTempQty(0),
        integral: 0,
        derivative: 0,
        derivativeFilter: FilterChoice.FILTER_NONE,
        integralReset: 0,
        boilPointAdjust: deltaTempQty(0),
        boilMinOutput: 0,
        boilModeActive: false,
      }),
      analyze: (block: PidBlock) => {
        const { enabled, inputId, outputId, active } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (inputId.id == null || outputId == null) {
          return 'Invalid';
        }
        if (!active) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<PidBlock>[] = [
      {
        type,
        key: 'kp',
        title: 'Kp',
        component: 'QuantityValEdit',
        generate: () => inverseTempQty(0),
      },
      {
        type,
        key: 'ti',
        title: 'Ti',
        component: 'DurationValEdit',
        generate: () => bloxQty('0s'),
        pretty: durationString,
      },
      {
        type,
        key: 'td',
        title: 'Td',
        component: 'DurationValEdit',
        generate: () => bloxQty('0s'),
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
        key: 'inputId',
        title: 'Input',
        component: 'LinkValEdit',
        generate: () =>
          bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
      },
      {
        type,
        key: 'outputId',
        title: 'Target',
        component: 'LinkValEdit',
        generate: () => bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
      },
      {
        type,
        key: 'inputSetting',
        title: 'Input target',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
        graphAxis: 'y2',
      },
      {
        type,
        key: 'inputValue',
        title: 'Input value',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
        graphAxis: 'y2',
      },
      {
        type,
        key: 'error',
        title: 'Error',
        component: 'QuantityValEdit',
        generate: () => deltaTempQty(0),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'p',
        title: 'P',
        component: 'NumberValEdit',
        generate: () => 0,
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'i',
        title: 'I',
        component: 'NumberValEdit',
        generate: () => 0,
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'd',
        title: 'D',
        component: 'NumberValEdit',
        generate: () => 0,
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'outputSetting',
        title: 'Output target (P+I+D)',
        component: 'NumberValEdit',
        generate: () => 0,
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'outputValue',
        title: 'Output value',
        component: 'NumberValEdit',
        generate: () => 0,
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'PID',
      role: 'Control',
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
