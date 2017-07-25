/* eslint-disable global-require */
const view = require('./view.json');

view.layouts = [
  require('./layouts/00_fill_kettle.json'),
  require('./layouts/01_only_kettle.json'),
  require('./layouts/02_rims_connected.json'),
  require('./layouts/03_add_grain.json'),
  require('./layouts/04_remove_grain_bag.json'),
  require('./layouts/05_boil.json'),
  require('./layouts/06_cool.json'),
  require('./layouts/07_fermentor_out.json'),
];
view.steps = [
  require('./steps/00_fill_kettle.json'),
  require('./steps/01_preheat_kettle.json'),
  require('./steps/02_add_grain.json'),
  require('./steps/03_mash_rest.json'),
  require('./steps/04_rercirc.json'),
  require('./steps/05_raise_mash_temp.json'),
  require('./steps/06_remove_grain_bag.json'),
  require('./steps/07_boil.json'),
  require('./steps/08_cool.json'),
  require('./steps/09_fermentor_out.json'),
];

export default view;
