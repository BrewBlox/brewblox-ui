import { FeatureService } from '../state';
import { fetchBlocks as fetch } from './store/actions';
import features from './features';
import page from './service/SparkPage.vue';
import wizard from './service/SparkWizard.vue';

import { register } from './store';

const service: FeatureService = {
  features,
  register,
  wizard,
  fetch,
  page,
  displayName: 'Spark Controller',
};

export default service;
