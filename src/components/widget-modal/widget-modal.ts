import Vue from 'vue';
import Component from 'vue-class-component';

import { widgetTypes, blocksByWidgetType } from './widget-types';

/* eslint-disable indent */
@Component
/* eslint-enable */
class WidgetModal extends Vue {
  currentStep: string = 'widgets';
  widgetType: string | null = null;
  block: string | null = null;
  needsSetup: boolean = false;

  get widgetTypes(): { label: string, value: string }[] {
    return Object.keys(widgetTypes).map(value => ({ value, label: widgetTypes[value] }));
  }

  get widgetName(): string {
    if (!this.widgetType) {
      return '';
    }

    return widgetTypes[this.widgetType];
  }

  get availableBlocksForWidget() {
    if (this.widgetType) {
      return blocksByWidgetType(this.$store, this.widgetType);
    }

    return [];
  }

  get blocksForWidget() {
    if (this.availableBlocksForWidget.length > 0) {
      return this.availableBlocksForWidget.map(block => ({
        label: `${block.serviceId}/${block.id}`,
        value: block,
      }));
    }

    return [{ label: `No available blocks for '${this.widgetName}'`, value: null }];
  }

  addToDashboard() {
    console.log('Add the widget to the dashboard');
  }
}

export default WidgetModal;
