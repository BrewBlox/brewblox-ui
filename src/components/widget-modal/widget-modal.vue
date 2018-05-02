<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import {
  widgetTypes,
  blocksByWidgetType,
  createBlockByWidgetType,
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
    }
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
        value: block,
      })),
      {
        label: `Create new block for '${this.widgetName}'`,
        icon: 'add',
        value: 'new',
      },
    ];
  }

  addToDashboard() {
    this.$props.onAddWidget(this.widgetType, this.block);
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
      <q-stepper
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

          <q-stepper-navigation>
            <q-btn
              :disabled="!widgetType"
              :color="!widgetType ? 'dark-bright' : 'primary'"
              @click="currentStep = 'blocks'"
              label="Next"
            />
          </q-stepper-navigation>
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

          <q-stepper-navigation>
            <q-btn
              @click="currentStep = 'widgets'"
              flat
              label="Go back"
            />

            <q-btn
              :disabled="!block"
              :color="!block ? 'dark-bright' : 'primary'"
              @click="currentStep = needsSetup ? 'blocks-setup' : 'finished'"
              label="Next"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          name="blocks-setup"
          title="Setup"
          :disable="!needsSetup"
        >
          Block Setup

          <q-stepper-navigation>
            <q-btn
              @click="currentStep = 'blocks'"
              flat
              label="Go back"
            />

            <q-btn
              color="primary"
              @click="currentStep = 'finished'"
              label="Next"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          name="finished"
          title="Finished"
        >
          <q-alert
            type="info"
            icon="info"
          >
            Widget setup is done!
          </q-alert>

          <q-stepper-navigation>
            <q-btn
              @click="currentStep = needsSetup ? 'blocks-setup' : 'blocks'"
              flat
              label="Go back"
            />

            <q-btn
              color="primary"
              @click="addToDashboard"
              label="Add to dashboard"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
      <div v-else>
        <component :is="widgetType" />
      </div>
    </div>
  </q-modal-layout>
</template>

<style>
.q-stepper-step-content {
  overflow: hidden;
}
</style>
