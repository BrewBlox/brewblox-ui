import { Link, Unit } from '@/helpers/units';
import Vue from 'vue';

export default (_: PluginArguments) => {
  Vue.filter('unit', (value: Unit) => value.toString());
  Vue.filter('link', (value: Link) => value.toString());
  Vue.filter('round', (value: any) => (typeof value !== 'number' ? value : +value.toFixed(2)));
};
