<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { deserialize, serialize } from '@/helpers/units/parseObject';

import QuickActionsBasic from './QuickActionsBasic.vue';
import QuickActionsFull from './QuickActionsFull.vue';
import { Step } from './types';

@Component({
  components: {
    Basic: QuickActionsBasic,
    Full: QuickActionsFull,
  },
})
export default class QuickActionsWidget extends WidgetBase {
  @Prop({ type: String, required: false })
  public readonly openStep!: string;

  get defaultServiceId(): string | null {
    return this.config.serviceId ?? null;
  }

  get steps(): Step[] {
    return deserialize(this.config.steps);
  }

  saveSteps(steps: Step[] = this.steps): void {
    this.config.steps = serialize(steps);
    this.saveConfig();
  }

  created(): void {
    let updated = false;
    // Change IDs were added after initial release
    // Check if the migration still has to happen, and then assign any undefined IDs
    if (!this.config.changeIdMigrated) {
      this.steps.forEach(step =>
        step.changes
          .filter(change => change.id === undefined)
          .forEach(change => change.id = uid()));
      this.config.changeIdMigrated = true;
    }
    // Service IDs became a key of individual changes
    if (!this.config.serviceIdMigrated) {
      this.steps.forEach(step =>
        step.changes
          .filter(change => change.serviceId === undefined)
          .forEach(change => change.serviceId = this.defaultServiceId));
      this.config.serviceIdMigrated = true;
    }
    if (updated) {
      this.saveSteps();
    }
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #menus>
          <WidgetActions :crud="crud">
            <ExportAction :crud="crud" />
          </WidgetActions>
        </template>
      </component>
    </template>
    <component :is="mode" :crud="crud" :open-step="openStep" />
  </CardWrapper>
</template>
