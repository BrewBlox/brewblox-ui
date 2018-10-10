import { ref } from '@/helpers/component-ref';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { RootStore } from '@/store/state';
import { Feature } from '@/store/features/state';
import widget from './GraphWidget.vue';
import wizard from './GraphWizard.vue';
import form from './GraphForm.vue';
import { GraphConfig } from './state';

const validator = (store: RootStore, config: GraphConfig) =>
  serviceAvailable(store, config.serviceId);

const feature: Feature = {
  validator,
  id: 'Graph',
  displayName: 'History graph',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
