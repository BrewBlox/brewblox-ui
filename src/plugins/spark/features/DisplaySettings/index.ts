import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';
import form from './DisplaySettingsForm.vue';
import widget from './DisplaySettingsWidget.vue';
import { typeName } from './getters';

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

export default feature;
