<script lang="ts">
import { Link } from '@/helpers/units';
import { fetchCompatibleBlocks } from '@/plugins/spark/store/actions';
import { compatibleBlocks } from '@/plugins/spark/store/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: Object,
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
    label: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'big',
    },
  },
})
export default class LinkPopupEdit extends Vue {
  placeholder = ''; // must not equal clear-value

  get linkOptions() {
    const compatible = compatibleBlocks(this.$store, this.$props.serviceId);
    return (compatible[this.$props.field.type || ''] || [])
      .map(id => ({
        label: id,
        value: id,
      }));
  }

  get displayValue() {
    return this.$props.field.id || 'click to assign';
  }

  startEdit() {
    this.placeholder = this.$props.field.id;
    fetchCompatibleBlocks(this.$store, this.$props.serviceId, this.$props.field.type);
  }

  endEdit() {
    this.$props.change(new Link(this.placeholder, this.$props.field.type));
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ displayValue | truncated }}</component>
    <q-popup-edit
      :title="this.$props.label"
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-select v-model="placeholder" :options="linkOptions" clearable/>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
