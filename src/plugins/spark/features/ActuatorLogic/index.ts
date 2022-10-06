import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { enumHint } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import {
  ActuatorLogicBlock,
  BlockIntfType,
  BlockType,
  LogicResult,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './ActuatorLogicWidget.vue';
import { nonErrorResults } from './const';

const type = BlockType.ActuatorLogic;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<ActuatorLogicBlock> = {
      type,
      generate: (): ActuatorLogicBlock['data'] => ({
        enabled: true,
        result: LogicResult.RESULT_EMPTY,
        errorPos: 0,
        targetId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
        analog: [],
        digital: [],
        expression: '',
      }),
      analyze: (block: ActuatorLogicBlock) => {
        const { enabled, targetId, result } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (targetId.id == null) {
          return 'Invalid';
        }
        if (!nonErrorResults.includes(result)) {
          return 'Invalid';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<ActuatorLogicBlock>[] = [
      {
        type,
        key: 'enabled',
        title: 'Enabled',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'result',
        title: 'Result',
        component: 'EnumValEdit',
        componentProps: { options: nonErrorResults },
        generate: () => LogicResult.RESULT_EMPTY,
        valueHint: enumHint(LogicResult),
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Logic Actuator',
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
