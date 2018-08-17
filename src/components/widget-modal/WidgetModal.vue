<script lang="ts">
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
  widgetType: WidgetType | null = null;
  block: string | null = null;
  needsSetup: boolean = false;

  get widgetTypes(): { label: string, value: string }[] {
    return Object.keys(widgetTypes).map(value =>
      ({ value, label: widgetTypes[value as WidgetType] }));
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
</script>

<template>
  <q-modal-layout>
    <q-toolbar
      slot="header"
      color="dark-bright"
    >
      <q-toolbar-title>
        New Widget
      </q-toolbar-title>
      <q-btn
        flat
        v-close-overlay
      >
        Close
      </q-btn>
    </q-toolbar>

    <div class="layout-padding">
      <transition name="slide">
        <q-stepper
          ref="stepper"
          v-model="currentStep"
          v-if="block !== 'new'"
        >
          <q-step
            default
            name="widgets"
            title="Widget Type"
          >
            <q-field
              label="Choose a widget type to add"
              orientation="vertical"
              dark
              icon="dashboard"
            >
              <q-option-group
                dark
                type="radio"
                v-model="widgetType"
                :options="widgetTypes"
              />
            </q-field>
          </q-step>

          <q-step
            name="blocks"
            title="Pick Block"
          >
            <q-field
              :label="`Pick block to associate with '${widgetName}' widget`"
              icon="widgets"
              orientation="vertical"
            >
              <q-select
                v-model="block"
                placeholder="Choose a block"
                :options="blocksForWidget"
              />
            </q-field>
          </q-step>

          <q-step
            name="blocks-setup"
            title="Setup"
            :disable="!needsSetup"
          >
            Block Setup
          </q-step>

          <q-step
            name="finished"
            title="Finished"
          >
            <p class="q-title">Widget ready!</p>
            <p>Widget setup is done, add the widget to your dashboard.</p>
          </q-step>

          <q-stepper-navigation>
            <q-btn
              v-if="currentStep !== 'widgets'"
              @click="$refs.stepper.previous()"
              flat
              label="Go back"
            />

            <q-btn
              :disabled="!canContinue"
              :color="!canContinue ? 'dark-bright' : 'primary'"
              @click="currentStep === 'finished' ? addToDashboard() : $refs.stepper.next()"
              :label="currentStep === 'finished' ? 'Add to dashboard' : 'Next'"
            />
          </q-stepper-navigation>
        </q-stepper>
        <div v-else>
          <component
            :is="widgetType"
            :onCancel="cancelCreate"
            :onCreate="createBlock"
          />
        </div>
      </transition>
    </div>
  </q-modal-layout>
</template>

<style>
.q-stepper-step-content {
  overflow: hidden;
}

.layout-padding {
  position: relative;
}

.slide-enter-active, .slide-leave-active {
  position: absolute;
  width: calc(100% - 96px);
  transition: opacity .2s, margin-top .2s;
}

.slide-enter, .slide-leave-to {
  opacity: 0;
  margin-top: -40px;
}
</style>
