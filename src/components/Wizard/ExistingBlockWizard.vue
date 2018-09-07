<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { allBlocks, blockById } from '@/store/blocks/getters';
import { dashboardItemById } from '@/store/dashboards/getters';

/* eslint-disable indent */
@Component({
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
  blockId: string = '';
  widgetId: string = '';
  currentStep: string = '';

  get blockOptions() {
    return allBlocks(this.$store)
      .map(block => ({
        label: `${block.serviceId}/${block.id}`,
        value: `${block.serviceId}/${block.id}`,
      }));
  }

  blockIdOk() {
    return !!this.blockId;
  }

  widgetIdOk() {
    return !!this.widgetId && !dashboardItemById(this.$store, this.widgetId as string);
  }

  onConfirm() {
    const { type } = blockById(this.$store, this.blockId);
    this.$props.onAddWidget(this.widgetId, type, { blockId: this.blockId });
  }

  @Watch('isOpen', { immediate: true, deep: true })
  onOpenedChange() {
    if (!this.$props.isOpen) {
      this.currentStep = '';
      this.blockId = '';
      this.widgetId = '';
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
                :error="!widgetIdOk()"
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
                :disabled="!blockIdOk() || !widgetIdOk()"
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
