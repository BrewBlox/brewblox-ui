import { ref } from '@/helpers/component-ref';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';
import form from './ActuatorPinForm.vue';
import widget from './ActuatorPinWidget.vue';
import { typeName } from './getters';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Pin Actuator',
  role: 'Output',
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
