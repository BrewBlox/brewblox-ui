import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import form from './ProcessViewForm.vue';
import widget from './ProcessViewWidget.vue';
import wizard from './ProcessViewWizard.vue';
import { parts } from './register';
import { ProcessViewConfig } from './state';

const feature: Feature = {
  id: 'ProcessView',
  displayName: 'Process View',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  validator: (store: any, config: ProcessViewConfig) =>
    config.parts.every(part => parts.includes(part.type)),
  widgetSize: {
    cols: 8,
    rows: 8,
  },
};

export default feature;
