import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './DisplaySettingsForm.vue';
import widget from './DisplaySettingsWidget.vue';
import { typeName } from './getters';
import { DisplaySettingsData, DisplayTempUnit } from './types';

const block: BlockSpec = {
  id: typeName,
  systemObject: true,
  generate: (): DisplaySettingsData => ({
    name: 'Display settings',
    tempUnit: DisplayTempUnit.Celsius,
    widgets: [],
  }),
  changes: [
    {
      key: 'name',
      title: 'Footer text',
      component: 'StringValEdit',
      generate: () => '',
    },
  ],
  presets: [],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Display Settings',
  role: 'Display',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  // DisplaySettings is a static system object, and can't be created or deleted
  wizard: undefined,
  deleters: undefined,
};

export default { feature, block };
