<script lang="ts">

import get from 'lodash/get';
import isString from 'lodash/isString';
import Component from 'vue-class-component';

import FormBase from '@/components/Form/FormBase';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import featureStore from '@/store/features';

import StepViewValue from './StepViewValue.vue';
import { dataProps } from './getters';
import { BlockChange, BlockProperty, Step, StepViewConfig } from './types';

interface BlockChangeDisplay extends BlockChange {
  key: string;
  block: Block;
  displayName: string;
  props: BlockProperty[];
}

interface StepDisplay extends Step {
  changes: BlockChangeDisplay[];
}

@Component({
  components: {
    StepViewValue,
  },
})
export default class StepViewForm extends FormBase {
  newStepName = '';
  editableChanges: Record<string, boolean> = {};

  get widgetConfig(): StepViewConfig {
    return this.$props.field;
  }

  get serviceId() {
    return this.widgetConfig.serviceId;
  }

  asBlockChangeDisplay(stepName: string, change: BlockChange): BlockChangeDisplay {
    const block = sparkStore.blocks(this.serviceId)[change.blockId];
    return {
      ...change,
      block,
      key: `__${stepName}__${change.blockId}`,
      displayName: block ? featureStore.displayNameById(block.type) : 'Unknown',
      props: block ? dataProps[block.type] : [],
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
        changes: step.changes.map(change => this.asBlockChangeDisplay(step.name, change)),
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
      .filter(block => !!get(dataProps, [block.type, 'length']))
      .map(block => block.id);
  }

  get stepNameRules(): InputRule[] {
    return [
      v => !!v || 'Name must not be empty',
      v => !this.steps.find(step => step.name === v) || 'Name is already in use',
    ];
  }

  get newStepNameOk() {
    return this.stepNameRules.every(rule => !isString(rule(this.newStepName)));
  }

  allData(change: BlockChangeDisplay): { [key: string]: any } {
    const propVals = change.props.reduce((acc, p) => ({ ...acc, [p.key]: null }), {});
    return {
      ...propVals,
      ...change.data,
    };
  }

  // unusedData(change: BlockChangeDisplay): { [key: string]: any } {
  //   return change.props
  //     .filter(prop => change.data[prop.key] === undefined)
  //     .reduce((acc, prop) => ({ ...acc, [prop.key]: null }), {});
  // }

  dataTitle(change: BlockChangeDisplay, key: string) {
    const prop = change.props.find(prop => prop.key === key) || { title: key };
    return prop.title;
  }

  removeChange(step: StepDisplay, key: string) {
    step.changes = step.changes.filter(change => change.key !== key);
    this.saveSteps(this.steps);
  }

  removeKey(change: BlockChangeDisplay, key: string) {
    this.$delete(change.data, key);
    this.saveSteps(this.steps);
  }

  updateStepName(oldName: string, newName: string) {
    if (oldName === newName) {
      return;
    }
    if (this.steps.find(step => step.name === newName)) {
      this.$q.notify({ message: `'${newName}' is already taken`, color: 'negative' });
      return;
    }
    const step = this.steps.find(step => step.name === oldName) as StepDisplay;
    step.name = newName;
    this.saveSteps(this.steps);
  }

  addStep() {
    this.steps.push({ name: this.newStepName, changes: [] });
    this.saveSteps(this.steps);
    this.newStepName = '';
  }

  isEditable(stepName: string, blockId: string) {
    const key = `__${stepName}__${blockId}`;
    return this.editableChanges[key] || false;
  }

  toggleEditable(stepName: string, blockId: string) {
    const key = `__${stepName}__${blockId}`;
    this.$set(this.editableChanges, key, !this.editableChanges[key]);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>

    <q-card-section>
      <div class="scroll-parent">
        <q-scroll-area>
          <q-expansion-item label="Configure Steps" group="steps" icon="edit">
            <q-item v-for="step in steps" :key="step.name" dark>
              <q-item-section>
                <InputPopupEdit
                  :field="step.name"
                  :change="v => updateStepName(step.name, v)"
                  label="Step Name"
                  tag="span"
                />
              </q-item-section>
            </q-item>
            <q-item dark>
              <q-item-section>
                <q-input v-model="newStepName" :rules="stepNameRules" dark label="New Step"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn :disable="!newStepNameOk" flat label="Add" icon="add" @click="addStep"/>
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item
            v-for="step in steps"
            :label="step.name"
            :key="step.name"
            group="steps"
            icon="mdi-format-list-checks"
          >
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
                    <q-btn flat round icon="close" @click="removeChange(step, change.key)">
                      <q-tooltip>Remove Block Change from Step</q-tooltip>
                    </q-btn>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      icon="mdi-pencil-off"
                      @click="$set(editableChanges, change.key, false)"
                    />
                  </q-item-section>
                </template>
                <template v-else>
                  <q-item-section side>
                    <q-btn flat round icon="edit" @click="$set(editableChanges, change.key, true)"/>
                  </q-item-section>
                </template>
              </q-item>
              <template v-if="isEditable(step.name, change.blockId)">
                <q-item v-for="(val, key) in allData(change)" :key="key" dark>
                  <q-item-section>{{ dataTitle(change, key) }}</q-item-section>
                  <q-item-section>{{ val }}</q-item-section>
                  <q-item-section>editable</q-item-section>
                </q-item>
              </template>
              <template v-else>
                <q-item v-for="(val, key) in change.data" :key="key" dark>
                  <q-item-section>{{ dataTitle(change, key) }}</q-item-section>
                  <q-item-section>{{ val }}</q-item-section>
                </q-item>
              </template>
            </q-list>
            <q-item dark>
              <q-item-section>
                <q-btn label="Add Block" outline/>
              </q-item-section>
            </q-item>
          </q-expansion-item>
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
