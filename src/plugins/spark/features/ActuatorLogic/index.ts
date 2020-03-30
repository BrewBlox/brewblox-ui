import { Link } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorLogicWidget.vue';
import { typeName } from './getters';
import { ActuatorLogicData } from './types';

const block: BlockSpec<ActuatorLogicData> = {
  id: typeName,
  generate: () => ({
    enabled: true,
    result: false,
    targetId: new Link(null, interfaceTypes.ActuatorDigital),
    analog: [],
    digital: [],
    expression: '',
  }),
  presets: [],
  changes: [],
  graphTargets: {
    result: 'Result',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'Logic Actuator',
  role: 'Control',
  component: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
