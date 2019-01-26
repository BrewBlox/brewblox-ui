<script lang="ts">
import { groupNames } from '@/plugins/spark/store/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class GroupsPopupEdit extends Vue {
  placeholder: any[] = [undefined]; // Ensures that value always changes during edit

  get groupOpts() {
    return groupNames(this.$store, this.$props.serviceId)
      .map((name: string, idx: number) => ({
        label: name,
        value: idx,
      }));
  }

  get displayValue() {
    const text = this.$props.field
      .map((v: any) => this.groupOpts.find((opt: any) => opt.value === v))
      .filter(v => v !== undefined)
      .map((v: any) => v.label)
      .join(', ');
    return text || 'Click to set';
  }

  startEdit() {
    this.placeholder = [...this.$props.field];
  }

  endEdit() {
    this.$props.change([...this.placeholder]);
  }
}
</script>

<template>
  <div>
    <component :is="$props.display" class="editable">{{ displayValue }}</component>
    <q-popup-edit
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      title="Select active groups"
      @show="startEdit"
      @save="endEdit"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-select v-model="placeholder" :options="groupOpts" clearable multiple/>
    </q-popup-edit>
  </div>
</template>
