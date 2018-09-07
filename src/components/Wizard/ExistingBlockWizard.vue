<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { map } from 'lodash';

import { Block } from '@/store/blocks/state';
import { allBlocks, blockById } from '@/store/blocks/getters';
import { dashboardItemById } from '@/store/dashboards/getters';

import { blocksByWidgetType, widgetDescriptions, widgetWizards } from './widget-types';
import { allTypes, displayNameByType, wizardByType } from '@/features/feature-by-type';

/* eslint-disable indent */
@Component({
  components: widgetWizards,
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
export default class ExistingBlockWizard extends Vue {
  blockId: string | null = null;
  widgetId: string | null = null;
  currentStep: string | null = null;
  failIdReason: string = '';

  get blockOptions() {
    return allBlocks(this.$store)
      .map(block => ({
        label: `${block.serviceId}/${block.id}`,
        value: `${block.serviceId}/${block.id}`,
      }));
  }

  widgetIdAvailable() {
    return this.widgetId && !dashboardItemById(this.$store, this.widgetId as string);
  }

  onConfirm() {
    const { type } = blockById(this.$store, this.blockId as string);
    this.$props.onAddWidget(this.widgetId, type, { blockId: this.blockId });
  }

  @Watch('isOpen', { immediate: true, deep: true })
  onOpenedChange() {
    if (!this.$props.isOpen) {
      this.currentStep = 'select_block';
      this.blockId = null;
      this.widgetId = null;
    }
  }
}
</script>

<template>
  <q-modal-layout>
    <q-toolbar
      slot="header"
      color="dark-bright"
    >
      <q-toolbar-title>
        New Widget (Existing Block)
      </q-toolbar-title>
      <q-btn
        flat
        v-close-overlay
        label="Close"
      />
    </q-toolbar>

    <div class="layout-padding">
      <transition name="slide">
        <q-stepper
          ref="stepper"
          v-model="currentStep"
        >

          <q-step
            default
            name="select_block"
            title="Select a Block"
          >

            <q-field
              label="Widget ID"
              icon="widgets"
              orientation="vertical"
            >
              <q-input
                v-model="widgetId"
                placeholder="Enter a widget ID"
                :error="!widgetIdAvailable()"
              />
            </q-field>

            <q-field
              label="Block"
              icon="widgets"
              orientation="vertical"
            >
              <q-select
                v-model="blockId"
                placeholder="Choose a block"
                :options="blockOptions"
              />
            </q-field>

          </q-step>

            <q-stepper-navigation>
              <q-btn
                color="primary"
                flat
                label="Add Widget"
                :disabled="!blockId || !widgetIdAvailable()"
                @click="onConfirm"
              />
            </q-stepper-navigation>

        </q-stepper>

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

.slide-enter-active,
.slide-leave-active {
  position: absolute;
  width: calc(100% - 96px);
  transition: opacity 0.2s, margin-top 0.2s;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
  margin-top: -40px;
}

.q-field {
  margin-bottom: 15px;
}
</style>
