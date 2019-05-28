<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import sparkStore from '@/plugins/spark/store';

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
    tag: {
      type: String,
      default: 'span',
    },
  },
})
export default class GroupsPopupEdit extends Vue {
  placeholder: any[] = [];
  active: boolean = false;

  get value(): any[] {
    return this.active
      ? this.placeholder
      : [];
  }

  set value(v: any[]) {
    this.placeholder = v;
  }

  get groupOpts() {
    return sparkStore.groupNames(this.$props.serviceId)
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
    this.active = true;
  }

  save() {
    this.$props.change([...this.placeholder]);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ displayValue }}</component>
    <q-popup-edit
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      title="Select active groups"
      @show="startEdit"
      @hide="active = false"
      @save="save"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-option-group v-model="placeholder" :options="groupOpts" dark type="checkbox"/>
    </q-popup-edit>
  </div>
</template>
