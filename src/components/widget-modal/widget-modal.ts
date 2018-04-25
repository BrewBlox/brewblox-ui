import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component
/* eslint-enable */
class WidgetModal extends Vue {
  currentStep: string = 'widgets';
  widgetType: string | null = null;
  widgetTypes: { label: string, value: string }[] = [
    { label: 'PID', value: 'pid' },
    { label: 'Sensor value', value: 'sensor' },
    { label: 'SetPoint', value: 'setpoint' },
  ];
}

export default WidgetModal;
