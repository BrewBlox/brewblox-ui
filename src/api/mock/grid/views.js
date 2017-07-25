/* eslint-disable global-require */
import hermsAutomatedValves from './herms-automated-valves';
import hermsManualValves from './herms-manual-valves';
import hermsHoseSwap from './herms-hose-swap';
import fermentation from './fermentation';
import rimsBiab from './rims-biab';

const views = {
  'herms-automated-valves': hermsAutomatedValves,
  'herms-manual-valves': hermsManualValves,
  'herms-hose-swap': hermsHoseSwap,
  'rims-biab': rimsBiab,
  fermentation,
  view1: require('./test_data/view1.json'),
  view2: require('./test_data/view2.json'),
  view3: require('./test_data/view3.json'),
  view4: require('./test_data/view4.json'),
  view5: require('./test_data/view5.json'),
  coilTest: require('./test_data/coil_test.json'),
  valveTeeTest: require('./test_data/valve_tee_test.json'),
};

export default views;
