<script lang="ts">
import { BalancerLink } from '@/helpers/units/KnownLinks';
import Component from 'vue-class-component';
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
  <div class="constraints-list gutter-y-xs">
    <div v-for="(cinfo, idx) in constraints" :key="idx" class="column">
      <div v-if="readonly" :class="{row: true, limiting: cinfo.limiting}">
        <span class="col">{{ label(cinfo.key) }}</span>
        <span class="col">
          {{ ( cinfo.key === 'balanced' ? cinfo.value.granted : cinfo.value) | unit }}
        </span>
      </div>
      <div v-else class="row">
        <SelectPopupEdit
          :options="constraintOptions"
          :field="cinfo.key"
          :change="callAndSaveConstraints(k => constraints[idx] = createConstraint(k))"
          clearable
          class="col-8"
          label="Constraint type"
        />
        <component
          v-if="cinfo.key === 'balanced'"
          :is="fieldType(cinfo.key)"
          :service-id="serviceId"
          :field="cinfo.value.balancerId"
          :change="callAndSaveConstraints(v => cinfo.value.balancerId = v)"
          class="col"
          label="Constraint value"
          type="number"
        />
        <component
          v-else
          :is="fieldType(cinfo.key)"
          :service-id="serviceId"
          :field="cinfo.value"
          :change="callAndSaveConstraints(v => cinfo.value = v)"
          class="col"
          label="Constraint value"
          type="number"
        />
        <q-btn class="col-1" icon="delete" @click="removeConstraint(idx); saveConstraints();"/>
      </div>
    </div>
    <div v-if="readonly && constraints.length === 0" class="column">
      <div class="row">None</div>
    </div>
    <div v-if="!readonly" class="row gutter-x-cs">
      <q-btn label="Add constraint">
        <q-popover>
          <q-list separator link>
            <q-item
              v-close-overlay
              v-for="opt in constraintOptions"
              :key="opt.value"
              @click.native="constraints.push(createConstraint(opt.value)); saveConstraints();"
            >{{ opt.label }}</q-item>
          </q-list>
        </q-popover>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.limiting {
  color: red;
}

.constraints-list {
  padding-top: 5px;
}
</style>
