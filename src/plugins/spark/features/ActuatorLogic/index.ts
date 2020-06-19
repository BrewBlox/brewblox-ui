import { genericBlockFeature } from '@/plugins/spark/generic';
import { interfaceTypes } from '@/plugins/spark/getters';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { ActuatorLogicBlock, BlockSpec, EvalResult } from '@/plugins/spark/types';
import { Link } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorLogicWidget.vue';
import { nonErrorResults } from './getters';

const typeName = 'ActuatorLogic';

const block: BlockSpec<ActuatorLogicBlock> = {
  id: typeName,
  generate: () => ({
    enabled: true,
    result: 'EMPTY',
    errorPos: 0,
    targetId: new Link(null, interfaceTypes.ActuatorDigital),
    drivenTargetId: new Link(null, interfaceTypes.ActuatorDigital, true),
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
      generate: (): EvalResult => 'TRUE',
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
