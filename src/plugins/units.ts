import Unit from '@/helpers/units/Unit';

export default ({ app, store, Vue }: PluginArguments) => {
  Vue.filter('unit', (value: Unit) => value.toString());
};
