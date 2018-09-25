import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import { blockById } from '@/plugins/spark/store/getters';
import widget from './GenericBlock.vue';
import wizard from '../BlockWizard.vue';

const validator = (store: any, config: any) =>
  blockById(store, config.serviceId, config.blockId) !== undefined;

const feature: Partial<Feature> = {
  validator,
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
