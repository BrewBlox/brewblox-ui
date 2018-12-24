import { ref, autoRegister } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './ProcessViewWidget.vue';
import wizard from './ProcessViewWizard.vue';

autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

const feature: Feature = {
  id: 'ProcessView',
  displayName: 'Process View',
  widget: ref(widget),
  wizard: ref(wizard),
  validator: (store: any, config: any) => true,
  widgetSize: {
    cols: 8,
    rows: 8,
  },
};

export default feature;
