import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './ProcessView.vue';

const feature: Feature = {
  id: 'ProcessView',
  displayName: 'Process View',
  widget: ref(widget),
  validator: (store: any, config: any) => true,
};

export default feature;
