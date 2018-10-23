<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Link } from '@/helpers/units';
import { MutexLink, BalancerLink } from '@/helpers/units/KnownLinks';
import { blockIds } from '@/plugins/spark/store/getters';

interface ConstraintInfo {
  key: string;
  value: any;
}

const asInfo = (con: any): ConstraintInfo => {
  const [key, ..._] = Object.keys(con);
  return { key, value: con[key] };
};

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
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
})
export default class DigitalConstraints extends Vue {
  get constraints(): ConstraintInfo[] {
    return this.$props
      .value
      .constraints
      .map(asInfo);
  }

  onChanged(vals: ConstraintInfo[]) {
    const constraints = vals
      .filter(info => !!info.key)
      .map(info => ({ [info.key]: info.value }));
    this.$emit('input', { constraints });
  }

  get constraintOptions() {
    const choices: { [key: string]: string[] } = {
      analog: [
        'min',
        'max',
        'balancer',
      ],
      digital: [
        'minOff',
        'minOn',
        'mutex',
      ],
    };
    return choices[this.$props.type]
      .map(v => ({ label: v, value: v }));
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

  fieldType(key: string) {
    switch (key) {
      case 'min':
      case 'max':
      case 'minOff':
      case 'minOn':
        return 'number';
      case 'mutex':
      case 'balancer':
        return 'link';
      default:
        return null;
    }
  }

  defaultValue(key: string) {
    switch (key) {
      case 'mutex':
        return new MutexLink(null);
      case 'balancer':
        return new BalancerLink(null);
      default:
        return null;
    }
  }

  addConstraint(key: string) {
    this.onChanged([...this.constraints, { key, value: this.defaultValue(key) }]);
  }

  updateConstraint(index: number, value: any) {
    this.constraints[index].value = value;
    this.onChanged(this.constraints);
  }

  updateLinkConstraint(index: number, id: string) {
    const old = this.constraints[index].value;
    this.constraints[index].value = new Link(id, old.type);
    this.onChanged(this.constraints);
  }

  changeConstraintType(index: number, key: string) {
    this.constraints[index] = { key, value: this.defaultValue(key) };
    this.onChanged(this.constraints);
  }
}
</script>

<template>
  <div>
    <!-- readonly display -->
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

    <!-- editable -->
    <div
      v-else
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
          @change="val => changeConstraintType(idx, val)"
        />

        <div class="col">
          <q-input
            v-if="fieldType(cinfo.key) === 'number'"
            type="number"
            :value="cinfo.value"
            @change="val => updateConstraint(idx, val)"
          />
          <q-select
            v-else-if="fieldType(cinfo.key) === 'link'"
            :options="linkOpts"
            :value="(cinfo.value || {}).id"
            @change="id => updateLinkConstraint(idx, id)"
          />
        </div>

      </div>
      <div
        class="row gutter-x-cs"
      >
        <q-select
          value=""
          :options="constraintOptions"
          @change="addConstraint"
          class="col-4"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.row-item {
  /* width: 160px; */
  margin-right: auto;
}
</style>
