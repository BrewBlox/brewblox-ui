import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { typeName } from './getters';
import widget from './ActuatorPwmWidget.vue';
import form from './ActuatorPwmForm.vue';

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'Pulse Width Modulator',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default feature;
