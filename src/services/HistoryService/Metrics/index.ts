import widget from './MetricsWidget.vue';
// import wizard from './MetricsWizard.vue';

const feature = {
  widget,
  validator: (store: any, config: any) => true,
  displayName: 'Metrics',
};

export default feature;
