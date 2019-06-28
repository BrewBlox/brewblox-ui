import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import form from './ProcessViewForm.vue';
import widget from './ProcessViewWidget.vue';
import wizard from './ProcessViewWizard.vue';
import { typeName } from './getters';
import { parts } from './register';
import { ProcessViewConfig } from './types';

const feature: Feature = {
  id: typeName,
  displayName: 'Process View',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  validator: (config: ProcessViewConfig) =>
    config.parts.every(part => parts.includes(part.type)),
  widgetSize: {
    cols: 8,
    rows: 8,
  },
};

export default { feature };
