<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Link, Unit } from '@/helpers/units';
import { blockTypes } from '@/plugins/spark/block-types';
import { digitalConstraintLabels } from '@/plugins/spark/helpers';

import ConstraintsBase, { EditableConstraint } from '../ConstraintsBase';

@Component
export default class DigitalConstraints extends ConstraintsBase {
  get constraintOptions(): SelectOption[] {
    return [...digitalConstraintLabels].map(([k, v]) => ({ label: v, value: k }));
  }

  createConstraint(key: string, value: any = null): EditableConstraint {
    switch (key) {
      case 'mutex':
        return {
          key,
          value: new Link(value, blockTypes.Mutex),
          limiting: false,
        };
      default:
        return {
          key,
          value: new Unit(0, 'second'),
          limiting: false,
        };
    }
  }

  addConstraint(): void {
    createDialog({
      title: 'Add constraint',
      cancel: true,
      options: {
        type: 'checkbox',
        model: [],
        items: this.constraintOptions,
      },
    })
      .onOk(keys => {
        this.constraints.push(...keys.map(this.createConstraint));
        this.saveConstraints();
      });
  }
}
</script>

<template>
  <q-list dense>
    <q-item
      v-for="(editable, idx) in constraints"
      :key="idx"
      :class="editable.limiting ? 'limiting' : ''"
    >
      <q-item-section>
        <SelectField
          :value="editable.key"
          :options="constraintOptions"
          clearable
          title="Constraint type"
          label="Constraint"
          @input="k => { constraints[idx] = createConstraint(k); saveConstraints() }"
        />
      </q-item-section>
      <q-item-section>
        <BlockField
          v-if="editable.key === 'mutex'"
          :service-id="serviceId"
          :value="editable.value"
          title="Mutex"
          label="Mutex"
          @input="v => { editable.value = v; saveConstraints(); }"
        />
        <TimeUnitField
          v-else
          :value="editable.value"
          title="Constraint value"
          label="Duration"
          @input="v => { editable.value = v; saveConstraints(); }"
        />
      </q-item-section>
      <q-item-section class="col-1 self-end darkish">
        <q-btn icon="delete" flat round @click="removeConstraint(idx); saveConstraints();">
          <q-tooltip>Remove constraint</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
    <q-item class="q-mt-md">
      <q-item-section />
      <q-item-section class="col-auto">
        <q-btn icon="add" round outline @click="addConstraint">
          <q-tooltip>Add constraint</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>
.limiting {
  color: orange;
}
</style>
