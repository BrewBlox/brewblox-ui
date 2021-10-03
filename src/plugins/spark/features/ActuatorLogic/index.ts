import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  ActuatorLogicBlock,
  BlockFieldSpec,
  BlockIntfType,
  BlockSpec,
  BlockType,
  LogicResult,
} from '@/plugins/spark/types';
import { blockWidgetSelector, enumHint } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';

import widget from './ActuatorLogicWidget.vue';
import { nonErrorResults } from './const';

const type = BlockType.ActuatorLogic;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<ActuatorLogicBlock> = {
      type,
      generate: () => ({
        enabled: true,
        result: LogicResult.RESULT_EMPTY,
        errorPos: 0,
        targetId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
        drivenTargetId: bloxLink(
          null,
          BlockIntfType.ActuatorDigitalInterface,
          true,
        ),
        analog: [],
        digital: [],
        expression: '',
      }),
    };

    const fieldSpecs: BlockFieldSpec<ActuatorLogicBlock>[] = [
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
