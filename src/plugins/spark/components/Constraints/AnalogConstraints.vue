<script lang="ts">
import Component from 'vue-class-component';
import Constraints, { ConstraintInfo } from './Constraints';
import { BalancerLink } from '@/helpers/units/KnownLinks';
import { Watch } from 'vue-property-decorator';

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
        return 'InputPopupEdit';
      case 'balancer':
        return 'LinkPopupEdit';
      default:
        return null;
    }
  }

  createConstraint(key: string, value: any = null): ConstraintInfo {
    switch (key) {
      case 'balancer':
        return { key, value: new BalancerLink(value) };
      default:
        return { key, value: 0 };
    }
  }
}
</script>

<template>
  <div class="column gutter-y-xs">

    <div v-for="(cinfo, idx) in constraints" :key="idx" class="row gutter-x-xs">
      <SelectPopupEdit clearable class="col-4" label="Constraint type" :options="constraintOptions" :field="cinfo.key" :change="callAndSaveConstraints(k => constraints[idx] = createConstraint(k))" />
      <component :is="fieldType(cinfo.key)" class="col" label="Constraint value" type="number" :serviceId="serviceId" :field="cinfo.value" :change="callAndSaveConstraints(v => cinfo.value = v)" />
      <q-btn class="col-1" icon="delete" @click="removeConstraint(idx); saveConstraints();" />
    </div>

    <div class="row gutter-x-cs">
      <q-btn label="Add constraint">
        <q-popover>
          <q-list separator link>
            <q-item v-close-overlay v-for="opt in constraintOptions" :key="opt.value" @click.native="constraints.push(createConstraint(opt.value)); saveConstraints();">
              {{ opt.label }}
            </q-item>
          </q-list>
        </q-popover>
      </q-btn>
    </div>

  </div>
</template>

<style scoped>
</style>
