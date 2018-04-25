import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable indent */
@Component
/* eslint-enable */
class WidgetModal extends Vue {
  currentStep: string = 'widgets';
}

export default WidgetModal;
