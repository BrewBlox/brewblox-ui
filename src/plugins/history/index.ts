import { createFeature } from '@/store/features/actions';
import Graph from './Graph';
import CurrentValue from './Metrics';

export default ({ store }: PluginArguments) => {
  createFeature(store, Graph);
  createFeature(store, CurrentValue);
};
