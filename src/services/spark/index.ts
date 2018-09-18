import { FeatureService } from '../state';
import { fetchBlocks } from './store/actions';
import features from './features';

import SparkWidget from './components/SparkWidget.vue';

import { register } from './store';

const service: FeatureService = {
  features,
  register,
  fetch: fetchBlocks,
  widget: SparkWidget,
};

export default service;
