import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import { typeName } from './getters';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import widget from './SetpointProfileWidget.vue';
import form from './SetpointProfileForm.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'SetpointProfile',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
