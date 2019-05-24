<script lang="ts">
import Component from 'vue-class-component';

import { BalancerLink } from '@/helpers/units/KnownLinks';

import Constraints, { ConstraintInfo } from './Constraints';

@Component
export default class AnalogConstraints extends Constraints {
  get constraintOptions() {
    return [...this.labels()].map(([k, v]) => ({ label: v, value: k }));
  }

  labels() {
    return new Map([
      ['min', 'Minimum'],
      ['max', 'Maximum'],
      ['balanced', 'Balanced'],
    ]);
  }

  label(k: string) {
    return this.labels().get(k);
  }

  fieldType(key: string) {
    switch (key) {
      case 'min':
      case 'max':
        return 'InputPopupEdit';
      case 'balanced':
        return 'LinkPopupEdit';
      default:
        return null;
    }
  }

  createConstraint(key: string, value: any = null): ConstraintInfo {
    switch (key) {
      case 'balanced':
        return { key, value: { balancerId: new BalancerLink(value) } };
      default:
        return { key, value: 0 };
    }
  }
}
</script>

<template>
  <div>
    <q-item-label v-if="constraints.length !== 0 && readonly" caption>Constraints</q-item-label>
    <q-list dark>
      <q-item v-for="(cinfo, idx) in constraints" :key="idx" dark dense>
        <template v-if="readonly">
          <q-item-section :class="{ limiting: cinfo.limiting }">{{ label(cinfo.key) }}</q-item-section>
          <q-item-section>{{ ( cinfo.key === 'balanced' ? cinfo.value.granted : cinfo.value) | unit }}</q-item-section>
        </template>
        <template v-else>
          <q-item-section>
            <SelectPopupEdit
              :options="constraintOptions"
              :field="cinfo.key"
              :change="callAndSaveConstraints(k => constraints[idx] = createConstraint(k))"
              clearable
              label="Constraint type"
              tag="span"
            />
          </q-item-section>
          <q-item-section>
            <component
              v-if="cinfo.key === 'balanced'"
              :is="fieldType(cinfo.key)"
              :service-id="serviceId"
              :field="cinfo.value.balancerId"
              :change="callAndSaveConstraints(v => cinfo.value.balancerId = v)"
              label="Constraint value"
              type="number"
              tag="span"
            />
            <component
              v-else
              :is="fieldType(cinfo.key)"
              :service-id="serviceId"
              :field="cinfo.value"
              :change="callAndSaveConstraints(v => cinfo.value = v)"
              label="Constraint value"
              type="number"
              tag="span"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn icon="delete" flat @click="removeConstraint(idx); saveConstraints();"/>
          </q-item-section>
        </template>
      </q-item>
      <q-item v-if="!readonly" dark>
        <q-item-section side>Add constraint</q-item-section>
        <q-item-section v-for="opt in constraintOptions" :key="opt.value">
          <q-btn
            :label="opt.label"
            outline
            @click="constraints.push(createConstraint(opt.value)); saveConstraints();"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.limiting {
  color: red;
}
</style>
