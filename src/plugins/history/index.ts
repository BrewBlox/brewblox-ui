import { createFeature } from '@/store/features/actions';
import Graph from './Graph';

export default ({ store }: PluginArguments) => {
  createFeature(store, Graph);
};
