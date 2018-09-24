import Vue from 'vue';
import Unit from '@/helpers/units/Unit';

export default (_: PluginArguments) => {
  Vue.filter('unit', (value: Unit) => value.toString());
};
