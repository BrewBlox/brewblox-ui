import { FeatureService } from '../state';
import { fetchBlocks } from './store/actions';
import features from './features';

import SparkPage from './pages/SparkPage.vue';
import SparkWidget from './components/SparkWidget.vue';

import { register } from './store';

const service: FeatureService = {
  features,
  register,
  fetch: fetchBlocks,
  widget: SparkWidget,
  page: SparkPage,
};

export default service;
