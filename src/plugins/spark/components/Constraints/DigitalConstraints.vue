<script lang="ts">
import { Unit } from '@/helpers/units';
import { MutexLink } from '@/helpers/units/KnownLinks';
import Component from 'vue-class-component';
import Constraints from './Constraints';

@Component
export default class DigitalConstraints extends Constraints {
  get constraintOptions() {
    return [...this.labels()].map(([k, v]) => ({ label: v, value: k }));
  }

  labels() {
    return new Map([
      ['minOff', 'Minimum OFF time'],
      ['minOn', 'Minimum ON time'],
      ['mutex', 'Mutually exclusive'],
    ]);
  }

  label(k: string) {
    return this.labels().get(k);
  }

  fieldType(key: string) {
    switch (key) {
      case 'minOff':
      case 'minOn':
        return 'UnitPopupEdit';
      case 'mutex':
        return 'LinkPopupEdit';
      default:
        return null;
    }
  }

  createConstraint(key: string, value: any = null) {
    switch (key) {
      case 'mutex':
        return { key, value: new MutexLink(value) };
      default:
        return { key, value: new Unit(0, 'second') };
    }
  }
}
</script>

<template>
  <q-list separator dark>
    <q-item dark v-for="(cinfo, idx) in constraints" :key="idx">
      <template v-if="readonly">
        <q-item-section :class="{ limiting: cinfo.limiting }" side>{{ label(cinfo.key) }}</q-item-section>
        <q-item-section>{{ cinfo.value | unit }}</q-item-section>
      </template>
      <template v-else>
        <q-item-section side>
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
    <q-item dark v-if="readonly && constraints.length === 0">
      <q-item-section>No Constraints</q-item-section>
    </q-item>
    <q-item dark v-if="!readonly">
      <q-item-section side>Add constraint</q-item-section>
      <q-item-section v-for="opt in constraintOptions" :key="opt.value">
        <q-btn
          :label="opt.label"
          outline
          @click="constraints.push(createConstraint(opt.value)); saveConstraints();"
          v-close-popup
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>
.limiting {
  color: red;
}
</style>
