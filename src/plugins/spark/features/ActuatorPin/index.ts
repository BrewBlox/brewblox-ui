import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { typeName } from './getters';
import widget from './ActuatorPinWidget.vue';
import form from './ActuatorPinForm.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Pin Actuator',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  // Pins are static system objects, and can't be created or deleted
  wizard: undefined,
  deleters: undefined,
};

export default feature;
