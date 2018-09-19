import { FeatureService } from '../state';
import { fetchBlocks as fetch } from './store/actions';
import features from './features';
import page from './components/SparkPage.vue';
import wizard from './components/SparkWizard.vue';

import { register } from './store';

const service: FeatureService = {
  features,
  register,
  page,
  wizard,
  fetch,
  displayName: 'Spark Controller',
};

export default service;
