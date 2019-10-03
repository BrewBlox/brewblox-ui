import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { blockWidgetSelector } from '../../helpers';
import { typeName } from './getters';
import widget from './InactiveObjectWidget.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Inactive Block',
  widgetComponent: blockWidgetSelector(widget),
  wizardComponent: undefined,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
