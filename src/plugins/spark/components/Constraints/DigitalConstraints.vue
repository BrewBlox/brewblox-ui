<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Link from '@/helpers/units/Link';
import { MinOffConstraint, MaxOffConstraint, MutexConstraint } from './state';
import { blockIds } from '@/plugins/spark/store/getters';
import { Stringifiable } from 'd3';

interface ConstraintInfo {
  key: string;
  value: any;
}

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Array,
      default: () => ([]),
    },
  },
})
export default class DigitalConstraints extends Vue {
  get constraints(): ConstraintInfo[] {
    return this.$props
      .value
      .map(this.constraintInfo);
  }

  set constraints(vals: ConstraintInfo[]) {
    this.$emit('input', vals.map(info => ({ [info.key]: info.value })));
  }

  constraintInfo(con: any): ConstraintInfo {
    const [key, ..._] = Object.keys(con);
    return { key, value: con[key] };
  }

  get constraintOptions() {
    return [
      'min',
      'max',
      'balancer',
    ].map(v => ({ label: v, value: v }));
  }

  get linkOpts() {
    const unset = new Link(null);
    return [
      { label: unset.toString(), value: unset.id },
      ...blockIds(this.$store, this.$props.serviceId)
        .map(id => ({
          label: id,
          value: id,
        })),
    ];
  }

  addConstraint(key: string) {
    this.constraints = [...this.constraints, { key, value: null }];
  }
}
</script>

<template>
  <div>
    <div
      v-if="$props.readonly"
    >
      <big
        v-for="(cinfo, idx) in constraints"
        :key="idx"
        class="row gutter-x-xs"
      >
        {{ cinfo.key }}: {{ cinfo.value }}
      </big>
    </div>

    <div v-else>

      <div
        v-for="(cinfo, idx) in constraints"
        :key="idx"
        class="row gutter-x-xs"
      >
        <q-select
          class="col-4"
          :value="cinfo.key"
          :options="constraintOptions"
        />

        <div class="col">
          <q-input
            v-if="cinfo.key === 'min'"
            type="number"
            v-model="cinfo.value"
          />
          <q-input
            v-else-if="cinfo.key === 'max'"
            type="number"
            v-model="cinfo.value"
          />
          <q-select
            v-else-if="cinfo.key === 'balancer'"
            :value="cinfo.value.id"
            :options="linkOpts"
          />
        </div>
      </div>

      <q-select
        value=""
        :options="constraintOptions"
        @select="addConstraint"
      />

    </div>
  </div>
</template>

<style scoped>
.row-item {
  /* width: 160px; */
  margin-right: auto;
}
</style>
