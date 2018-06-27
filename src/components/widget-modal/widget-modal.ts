import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { Block } from '@/store/blocks/state';

import {
  widgetTypes,
  blocksByWidgetType,
  widgetComponents,
} from './widget-types';

/* eslint-disable indent */
@Component({
  components: widgetComponents,
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    onAddWidget: {
      type: Function,
      default: () => { throw new Error('Provide onAddWidget callback'); },
    },
  },
})
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
      return blocksByWidgetType(this.$store, this.widgetType as WidgetType);
    }

    return [];
  }

  get blocksForWidget() {
    return [
      ...this.availableBlocksForWidget.map(block => ({
        label: `${block.serviceId}/${block.id}`,
        value: `${block.serviceId}/${block.id}`,
      })),
      {
        label: `Create new block for '${this.widgetName}'`,
        icon: 'add',
        value: 'new',
      },
    ];
  }

  get canContinue() {
    if (this.currentStep === 'widgets' && this.widgetType) {
      return true;
    }

    if (this.currentStep === 'blocks' && this.block) {
      return true;
    }

    if (this.currentStep === 'finished' && this.block) {
      return true;
    }

    return false;
  }

  addToDashboard() {
    this.$props.onAddWidget(this.widgetType, this.block);
  }

  cancelCreate() {
    this.block = null;
  }

  createBlock(block: Block) {
    this.block = `${block.serviceId}/${block.id}`;
  }

  @Watch('isOpen', { immediate: true, deep: true })
  onOpenedChange() {
    if (!this.$props.isOpen) {
      // closed modal
      this.currentStep = 'widgets';
      this.widgetType = null;
      this.block = null;
    }
  }
}

export default WidgetModal;
