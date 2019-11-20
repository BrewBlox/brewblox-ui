<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Link } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { analogConstraintLabels } from '@/plugins/spark/helpers';

import ConstraintsBase, { EditableConstraint } from '../ConstraintsBase';

@Component
export default class AnalogConstraints extends ConstraintsBase {
  get constraintOptions(): SelectOption[] {
    return [...analogConstraintLabels].map(([k, v]) => ({ label: v, value: k }));
  }

  createConstraint(key: string, value: any = null): EditableConstraint {
    switch (key) {
      case 'balanced':
        return {
          key,
          value: {
            balancerId: new Link(value, interfaceTypes.Balancer),
            granted: 0,
            id: 0,
          },
          limiting: false,
        };
      default:
        return {
          key,
          value: 0,
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
      dense
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
          v-if="editable.key === 'balanced'"
          :service-id="serviceId"
          :value="editable.value.balancerId"
          title="Balancer"
          label="Balancer"
          @input="v => { editable.value.balancerId = v; saveConstraints() }"
        />
        <InputField
          v-else
          :value="editable.value"
          title="Constraint value"
          label="Value"
          type="number"
          @input="v => { editable.value = v; saveConstraints() }"
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
