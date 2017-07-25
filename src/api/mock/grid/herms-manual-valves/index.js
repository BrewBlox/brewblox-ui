/* eslint-disable global-require */
const view = require('./view.json');

view.layouts = [
  require('./layout.json'),
];
view.steps = [
  require('./steps/01_valves_closed.json'),
  require('./steps/02_valves_open.json'),
  require('./steps/03_fill_hlt.json'),
  require('./steps/04_fill_bk.json'),
  require('./steps/05_prime_pumps.json'),
  require('./steps/06_heat_hlt_and_bk.json'),
  require('./steps/07_add_grain.json'),
  require('./steps/08_mash_in.json'),
  require('./steps/09_mash_rest.json'),
  require('./steps/10_mash_recirc.json'),
  require('./steps/11_mash_out.json'),
  require('./steps/12_fly_sparge.json'),
  require('./steps/13_sparge_out.json'),
  require('./steps/14_boil.json'),
  require('./steps/15_cool.json'),
  require('./steps/16_fermenter_out.json'),
  require('./steps/17_fermenter_top_up.json'),
  require('./steps/18_cip_water_mt.json'),
  require('./steps/19_cip_water_bk.json'),
  require('./steps/20_cip_water_coil.json'),
  require('./steps/21_cip_water_cfc.json'),
  require('./steps/22_cip_prepare_cleaner.json'),
  require('./steps/23_cip_cleaner_mt_coil.json'),
  require('./steps/24_cip_cleaner_to_bk.json'),
  require('./steps/25_cip_cleaner_bk_cfc.json'),
  require('./steps/26_cip_cleaner_drain.json'),
];

export default view;
