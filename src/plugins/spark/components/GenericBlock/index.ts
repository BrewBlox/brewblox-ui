import { ref } from '@/helpers/component-ref';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { RootStore } from '@/store/state';
import { Feature } from '@/store/features/state';
import { BlockConfig } from '@/plugins/spark/state';
import { blockById } from '@/plugins/spark/store/getters';
import { removeBlock } from '@/plugins/spark/store/actions';
import widget from './GenericBlock.vue';
import wizard from '../BlockWizard.vue';

const validator = (store: RootStore, config: BlockConfig) =>
  serviceAvailable(store, config.serviceId) &&
  blockById(store, config.serviceId, config.blockId) !== undefined;

const onDelete = (store: RootStore, config: BlockConfig) =>
  removeBlock(store, config.serviceId, blockById(store, config.serviceId, config.blockId));

const feature: Partial<Feature> = {
  validator,
  onDelete,
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
