<script lang="ts">
import Component from 'vue-class-component';
import Constraints from './Constraints';
import { BalancerLink } from '@/helpers/units/KnownLinks';

@Component
export default class AnalogConstraints extends Constraints {
  get constraintOptions() {
    return [
      'min',
      'max',
      'balancer',
    ]
      .map(v => ({ label: v, value: v }));
  }

  fieldType(key: string) {
    switch (key) {
      case 'min':
      case 'max':
        return 'number';
      case 'balancer':
        return 'link';
      default:
        return null;
    }
  }

  createConstraint(key: string, value: any = null) {
    switch (key) {
      case 'balancer':
        return { key, value: new BalancerLink(value) };
      default:
        return { key, value };
    }
  }
}
</script>

<template>
  <div
    class="column gutter-y-xs"
  >

    <div
      v-for="(cinfo, idx) in constraints"
      :key="idx"
      class="row gutter-x-xs"
    >

      <q-select
        class="col-4"
        :options="constraintOptions"
        :value="cinfo.key"
        clearable
        @change="key => updateConstraint(idx, createConstraint(key))"
      />

      <div class="col">
        <q-input
          v-if="fieldType(cinfo.key) === 'number'"
          type="number"
          :value="cinfo.value"
          @change="value => updateConstraint(idx, createConstraint(cinfo.key, value))"
        />
        <q-select
          v-else-if="fieldType(cinfo.key) === 'link'"
          :options="linkOpts(cinfo.value)"
          :value="cinfo.value.id"
          @change="id => updateConstraint(idx, createConstraint(cinfo.key, id))"
        />
      </div>

    </div>

    <div
      class="row gutter-x-cs"
    >
      <q-select
        value=""
        :options="constraintOptions"
        @change="key => addConstraint(createConstraint(key))"
        class="col-4"
      />
    </div>

  </div>
</template>

<style scoped>
</style>
