import { Link } from '@/plugins/spark/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, enumHint } from '@/plugins/spark/helpers';
import { ActuatorLogicBlock, BlockIntfType, BlockSpec, LogicResult } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorLogicWidget.vue';
import { nonErrorResults } from './getters';

const typeName = 'ActuatorLogic';

const block: BlockSpec<ActuatorLogicBlock> = {
  id: typeName,
  generate: () => ({
    enabled: true,
    result: LogicResult.RESULT_EMPTY,
    errorPos: 0,
    targetId: new Link(null, BlockIntfType.ActuatorDigitalInterface),
    drivenTargetId: new Link(null, BlockIntfType.ActuatorDigitalInterface, true),
    analog: [],
    digital: [],
    expression: '',
  }),
  fields: [
    {
      key: 'result',
      title: 'Result',
      component: 'EnumValEdit',
      componentProps: { options: nonErrorResults },
      generate: () => LogicResult.RESULT_EMPTY,
      valueHint: enumHint(LogicResult),
      readonly: true,
      graphed: true,
    },
  ],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Logic Actuator',
  role: 'Control',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
