<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { conditionComponents } from '../conditions';
import { AutomationCondition, AutomationStep } from '../types';


@Component
export default class AutomationConditionSection extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  conditionComponent(condition: AutomationCondition): VueConstructor {
    return conditionComponents[condition.impl.type];
  }

  saveCondition(condition: AutomationCondition): void {
    spliceById(this.step.conditions, condition);
    this.saveStep();
  }

  saveAllConditions(conditions: AutomationCondition[]): void {
    this.step.conditions = conditions;
    this.saveStep();
  }

  startChangeTitle(condition: AutomationCondition): void {
    createDialog({
      parent: this,
      component: 'InputDialog',
      title: 'Change condition name',
      message: `Choose a new name for '${condition.title}'`,
      clearable: false,
      value: condition.title,
    })
      .onOk(title => this.saveCondition({ ...condition, title }));
  }

  startAddCondition(): void {

  }

  removeCondition(condition: AutomationCondition): void {
    spliceById(this.step.conditions, condition, false);
    this.saveStep();
  }
}
</script>

<template>
  <AutomationEditorSection
    :value="step.conditions"
    label="Conditions"
    @input="saveAllConditions"
    @update="saveCondition"
    @title-click="item => startChangeTitle(item)"
    @new="startAddCondition"
  >
    <template #description>
      The step ends when all conditions are satisfied.
    </template>
    <template #actions="{item}">
      <ActionItem label="Rename" icon="mdi-textbox" @click="startChangeTitle(item)" />
      <ActionItem label="Remove" icon="delete" @click="removeCondition(item)" />
    </template>
    <template #item="{item}">
      <component
        :is="conditionComponent(item)"
        :condition="item"
        :class="[{darkish: !item.enabled}]"
        @update:condition="saveCondition"
      />
    </template>
    <template #footer>
      <div class="q-gutter-y-md column">
        <div class="clickable q-pa-md rounded-borders text-italic">
          New condition
        </div>
      </div>
    </template>
  </AutomationEditorSection>
</template>
