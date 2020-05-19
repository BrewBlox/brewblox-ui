<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
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
    this.steps.forEach(step =>
      step.changes
        .filter(change => change.id === undefined)
        .forEach(change => {
          change.id = uid();
          updated = true;
        }));
    // Service IDs became a key of individual changes
    this.steps.forEach(step =>
      step.changes
        .filter(change => change.serviceId === undefined)
        .forEach(change => {
          change.serviceId = this.defaultServiceId;
          updated = true;
        }));
    if (updated) {
      this.config.serviceIdMigrated = true;
      this.config.changeIdMigrated = true;
      this.saveSteps();
    }
  }

  addStep(): void {
    const stepName = 'New Step';
    createDialog({
      title: 'Add a Step',
      cancel: true,
      prompt: {
        model: stepName,
        type: 'text',
      },
    })
      .onOk(name => {
        this.steps.push({ name, id: uid(), changes: [] });
        this.saveSteps();
      });
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
    <component :is="mode" :crud="crud" :open-step="openStep">
      <template v-if="config.steps.length === 0" #warnings>
        <div class="text-italic text-h6 q-pa-md darkened text-center">
          Create a step to get started.
        </div>
      </template>
      <template #below>
        <q-btn
          flat
          dense
          color="secondary"
          icon="add"
          label="New step"
          class="self-end"
          @click="addStep"
        />
      </template>
    </component>
  </CardWrapper>
</template>
