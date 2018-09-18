import { FeatureService } from '../state';
import { startup } from './store';
import features from './features';

import SparkWidget from './components/SparkWidget.vue';

const service: FeatureService = {
  features,
  fetch: startup,
  widget: SparkWidget,
};

export default service;
