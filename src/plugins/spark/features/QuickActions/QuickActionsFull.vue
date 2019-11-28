<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';
import { deepCopy } from '@/helpers/units/parseObject';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import { sparkStore } from '@/plugins/spark/store';

import QuickActionChange from './QuickActionChange.vue';
import { BlockChange, QuickActionsConfig, Step } from './types';

@Component({
  components: {
    QuickActionChange,
  },
})
export default class QuickActionsFull extends CrudComponent<QuickActionsConfig> {
  draggingStep = false;
  editableChanges: Mapped<boolean> = {};

  @Prop({ type: String })
  readonly openStep!: string;

  get serviceId(): string {
    return this.config.serviceId;
  }

  get steps(): Step[] {
    const steps = deserialize(this.config.steps);
    for (const step of steps) {
      for (const change of step.changes) {
        change.id = change.id ?? uid();
      }
    }
    return steps;
  }

  saveSteps(steps: Step[] = this.steps): void {
    this.saveConfig({
      ...this.config,
      steps: serialize(steps),
    });
  }

  saveStep(step: Step): void {
    spliceById(this.steps, step);
    this.saveSteps();
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

  duplicateStep(step: Step): void {
    this.steps.push({
      id: uid(),
      name: `${step.name} (copy)`,
      changes: step.changes.map(change => ({ ...deepCopy(change), id: uid() })),
    });
    this.saveSteps();
  }

  renameStep(step: Step): void {
    const stepName = step.name;
    createDialog({
      title: 'Change Step name',
      message: `Choose a new name for '${step.name}'`,
      cancel: true,
      prompt: {
        model: stepName,
        type: 'text',
      },
    })
      .onOk(newName => {
        if (newName !== stepName) {
          step.name = newName;
          this.saveStep(step);
        }
      });
  }

  removeStep(step: Step): void {
    createDialog({
      title: 'Remove Step',
      message: `Are you sure you want to remove ${step.name}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => this.saveSteps(this.steps.filter(s => s.id !== step.id)));
  }

  addChange(step: Step): void {
    createDialog({
      component: 'BlockSelectDialog',
      title: 'Choose a Block',
      filter: block => {
        const spec = sparkStore.specs[block.type];
        return !!spec
          && spec.changes.length > 0
          && step.changes.every(change => change.blockId !== block.id);
      },
      parent: this,
      serviceId: this.serviceId,
    })
      .onOk(block => {
        step.changes.push({ id: uid(), blockId: block.id, data: {}, confirmed: {} });
        this.saveStep(step);
      });
  }

  saveChanges(step: Step, changes: BlockChange[]): void {
    step.changes = changes;
    this.saveStep(step);
  }

  saveChange(step: Step, change: BlockChange): void {
    spliceById(step.changes, change);
    this.saveStep(step);
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <div class="scroll-parent">
        <q-scroll-area>
          <draggable
            :value="steps"
            @input="saveSteps"
            @start="draggingStep=true"
            @end="draggingStep=false"
          >
            <q-expansion-item
              v-for="step in steps"
              :key="step.id"
              :label="step.name"
              :default-opened="openStep === step.id"
              :disable="draggingStep"
              group="steps"
              icon="mdi-format-list-checks"
            >
              <draggable :value="step.changes" @input="v => saveChanges(step, v)">
                <QuickActionChange
                  v-for="change in step.changes"
                  :key="`change--${step.id}--${change.id}`"
                  :service-id="serviceId"
                  :value="change"
                  @input="saveChange(step, change)"
                />
              </draggable>
              <div class="row wrap q-ma-md">
                <q-btn
                  size="sm"
                  label="Add Block"
                  icon="mdi-cube"
                  flat
                  @click="addChange(step)"
                />
                <q-btn
                  size="sm"
                  label="Copy Step"
                  icon="file_copy"
                  flat
                  @click="duplicateStep(step)"
                />
                <q-btn
                  size="sm"
                  label="Rename Step"
                  icon="edit"
                  flat
                  @click="renameStep(step)"
                />
                <q-btn
                  size="sm"
                  label="Remove Step"
                  icon="delete"
                  flat
                  @click="removeStep(step)"
                />
              </div>
            </q-expansion-item>
          </draggable>
          <q-item>
            <q-space />
            <q-item-section class="col-auto">
              <q-btn round outline icon="add" @click="addStep">
                <q-tooltip>Add Step</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-scroll-area>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.scroll-parent {
  height: 600px;
  max-height: 80vh;
}
</style>
