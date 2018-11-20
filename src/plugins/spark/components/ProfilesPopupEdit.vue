<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { profileNames } from '@/plugins/spark/store/getters';

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
export default class ProfilesPopupEdit extends Vue {
  placeholder = [];

  get profileOpts() {
    return profileNames(this.$store, this.$props.serviceId)
      .map((name: string, idx: number) => ({
        label: name,
        value: idx,
      }));
  }

  get displayValue() {
    const text = this.$props.field
      .map((v: any) => this.profileOpts.find((opt: any) => opt.value === v))
      .map((v: any) => v.label)
      .join(', ');
    return text || '-';
  }

  startEdit() {
    this.placeholder = this.$props.field;
  }

  endEdit() {
    this.$props.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <component :is="$props.display" class="editable">{{ displayValue }}</component>
    <q-popup-edit buttons persistent title="Select active profiles" v-model="placeholder" @show="startEdit" @save="endEdit">
      <q-select multiple v-model="placeholder" :options="profileOpts" />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
