<script lang="ts">

import get from 'lodash/get';
import { Dialog, uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import FormBase from '@/components/Form/FormBase';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import featureStore from '@/store/features';

import { changeProps } from './getters';
import { BlockChange, ChangeProperty, Step, StepViewConfig } from './types';

interface BlockChangeDisplay extends BlockChange {
  key: string;
  block: Block;
  displayName: string;
  props: ChangeProperty[];
}

interface StepDisplay extends Step {
  changes: BlockChangeDisplay[];
}

@Component({
  props: {
    openStep: {
      type: String,
      default: '',
    },
  },
})
export default class StepViewForm extends FormBase {
  editableChanges: Record<string, boolean> = {};

  get widgetConfig(): StepViewConfig {
    return this.$props.field;
  }

  get serviceId() {
    return this.widgetConfig.serviceId;
  }

  asBlockChangeDisplay(stepId: string, change: BlockChange): BlockChangeDisplay {
    const block = sparkStore.blocks(this.serviceId)[change.blockId];
    return {
      ...change,
      block,
      key: `__${stepId}__${change.blockId}`,
      displayName: block ? featureStore.displayNameById(block.type) : 'Unknown',
      props: block ? changeProps[block.type] : [],
    };
  }

  asBlockChange(change: BlockChangeDisplay): BlockChange {
    const { blockId, data } = change;
    return { blockId, data };
  }

  get steps(): StepDisplay[] {
    return deserialize(this.widgetConfig.steps)
      .map(step => ({
        ...step,
        changes: step.changes.map(change => this.asBlockChangeDisplay(step.id, change)),
      }));
  }

  saveSteps(steps: StepDisplay[]) {
    this.saveConfig({
      ...this.widgetConfig,
      steps: serialize(steps.map(step => ({
        ...step,
        changes: step.changes.map(this.asBlockChange),
      }))),
    });
  }

  get blockIdOpts(): string[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => !!get(changeProps, [block.type, 'length']))
      .map(block => block.id);
  }

  allData(change: BlockChangeDisplay): { [key: string]: any } {
    const propVals = change.props.reduce((acc, p) => ({ ...acc, [p.key]: null }), {});
    return {
      ...propVals,
      ...change.data,
    };
  }

  findProp(change: BlockChangeDisplay, key: string): ChangeProperty {
    return change.props.find(prop => prop.key === key) as ChangeProperty;
  }

  componentProps(change: BlockChangeDisplay, key: string): any {
    const prop = this.findProp(change, key);
    return {
      serviceId: this.serviceId,
      blockId: change.blockId,
      ...prop.componentProps || {},
    };
  }

  addStep() {
    let stepName = 'New Step';
    Dialog.create({
      title: 'Add a Step',
      dark: true,
      cancel: true,
      prompt: {
        model: stepName,
        type: 'text',
      },
    })
      .onOk(name => {
        this.steps.push({ name, id: uid(), changes: [] });
        this.saveSteps(this.steps);
      });
  }

  renameStep(step: StepDisplay) {
    let stepName = step.name;
    Dialog.create({
      title: 'Change Step name',
      message: `Choose a new name for '${step.name}'`,
      dark: true,
      cancel: true,
      prompt: {
        model: stepName,
        type: 'text',
      },
    })
      .onOk(newName => {
        const updatedStep = this.steps.find(s => s.id === step.id);
        if (step.name !== newName && updatedStep) {
          updatedStep.name = newName;
          this.saveSteps(this.steps);
        }
      });
  }

  removeStep(step: StepDisplay) {
    Dialog.create({
      title: 'Remove Step',
      message: `Are you sure you want to remove ${step.name}?`,
      dark: true,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => this.saveSteps(this.steps.filter(s => s.id !== step.id)));
  }

  addChange(step: StepDisplay) {
    Dialog.create({
      component: 'BlockChoiceDialog',
      title: 'Choose a Block',
      filter: block => {
        return !!changeProps[block.type]
          && !step.changes.find(change => block.id === change.blockId);
      },
      root: this.$root,
      serviceId: this.serviceId,
    })
      .onOk(block => {
        const updatedStep = this.steps.find(s => s.id === step.id);
        if (updatedStep) {
          updatedStep.changes.push(this.asBlockChangeDisplay(step.id, { blockId: block.id, data: {} }));
          this.saveSteps(this.steps);
        }
      });
  }

  removeChange(step: StepDisplay, key: string) {
    step.changes = step.changes.filter(change => change.key !== key);
    this.saveSteps(this.steps);
  }

  addField(change: BlockChangeDisplay, key: string) {
    const prop = this.findProp(change, key);
    this.$set(change.data, key, prop.generate());
    this.saveSteps(this.steps);
  }

  updateField(change: BlockChangeDisplay, key: string, val: any) {
    this.$set(change.data, key, val);
    this.saveSteps(this.steps);
  }

  removeField(change: BlockChangeDisplay, key: string) {
    this.$delete(change.data, key);
    this.saveSteps(this.steps);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>
      <div class="scroll-parent">
        <q-scroll-area>
          <q-expansion-item
            v-for="step in steps"
            :label="step.name"
            :key="step.id"
            :default-opened="$props.openStep === step.id"
            group="steps"
            icon="mdi-format-list-checks"
          >
            <q-item dark>
              <q-item-section class="col-auto">
                <q-btn size="sm" label="Add Block" flat icon="mdi-cube" @click="addChange(step)"/>
              </q-item-section>
              <q-item-section/>
              <q-item-section class="col-auto">
                <q-btn size="sm" label="Rename Step" flat icon="edit" @click="renameStep(step)"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn size="sm" label="Remove Step" flat icon="delete" @click="removeStep(step)"/>
              </q-item-section>
            </q-item>
            <q-list
              v-for="change in step.changes"
              :key="change.blockId"
              dark
              bordered
              class="q-mb-sm"
              dense
            >
              <q-item dark>
                <q-item-section class="text-h6">{{ change.blockId }}</q-item-section>
                <template v-if="editableChanges[change.key]">
                  <q-item-section side>
                    <q-btn flat round icon="delete" @click="removeChange(step, change.key)">
                      <q-tooltip>Remove Block Change from Step</q-tooltip>
                    </q-btn>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      round
                      flat
                      color="primary"
                      icon="mdi-check"
                      @click="$set(editableChanges, change.key, false)"
                    >
                      <q-tooltip>Stop editing</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </template>
                <template v-else>
                  <q-item-section side>
                    <q-btn flat round icon="edit" @click="$set(editableChanges, change.key, true)">
                      <q-tooltip>Edit Block Change</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </template>
              </q-item>
              <template v-if="editableChanges[change.key]">
                <q-item v-for="(val, key) in allData(change)" :key="key" dark>
                  <q-item-section>{{ findProp(change, key).title }}</q-item-section>
                  <template v-if="val === null">
                    <q-item-section/>
                    <q-item-section side>
                      <q-btn flat round icon="add" @click="addField(change, key)">
                        <q-tooltip>
                          Add field to Block Change
                          <br>The field will be changed when the Step is applied.
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </template>
                  <template v-else>
                    <q-item-section>
                      <component
                        :is="findProp(change, key).component"
                        v-bind="componentProps(change, key)"
                        :value="val"
                        editable
                        @input="v => updateField(change, key, v)"
                      />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round icon="mdi-close" @click="removeField(change, key)">
                        <q-tooltip>
                          Remove field from Block Change.
                          <br>The field will not be changed when the Step is applied.
                        </q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </template>
                </q-item>
              </template>
              <template v-else>
                <q-item v-for="(val, key) in change.data" :key="key" dark>
                  <q-item-section>{{ findProp(change, key).title }}</q-item-section>
                  <q-item-section>
                    <component
                      :is="findProp(change, key).component"
                      v-bind="componentProps(change, key)"
                      :value="val"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-expansion-item>
          <q-item dark>
            <q-item-section/>
            <q-item-section side>
              <q-btn fab outline icon="add" @click="addStep">
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
