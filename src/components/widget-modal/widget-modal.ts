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
      const availableBlocks = blocksByWidgetType(this.$store, this.widgetType);

      if (availableBlocks.length > 0) {
        return [];
      }
    }

    return [];
  }

  get blocksForWidget() {
    if (this.availableBlocksForWidget.length > 0) {
      return [{ label: 'Widget here', value: 1 }];
    }

    return [{ label: `No available blocks for '${this.widgetName}'`, value: null }];
  }
}

export default WidgetModal;
