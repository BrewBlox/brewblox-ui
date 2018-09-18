import { FeatureService } from '../state';
import { register } from './store';
import { fetchBlocks } from './store/actions';
import features from './features';

import SparkWidget from './components/SparkWidget.vue';

const service: FeatureService = {
  features,
  register,
  fetch: fetchBlocks,
  widget: SparkWidget,
};

export default service;
