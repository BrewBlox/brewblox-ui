<script lang="ts">
import { Unit } from '@/helpers/units';
import Vue from 'vue';
import Component from 'vue-class-component';
import { unitDurationString } from '@/helpers/functional';
import parseDuration from 'parse-duration';

@Component({
  props: {
    field: {
      type: Object,
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
export default class TimeUnitPopupEdit extends Vue {
  placeholder: any = NaN; // must not equal clear-value

  startEdit() {
    this.placeholder = unitDurationString(this.$props.field);
  }

  endEdit() {
    const fieldCopy = new Unit(parseDuration(this.placeholder), 'ms');
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ this.$props.field | unitDuration }}</component>
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
      <q-input v-model="placeholder" dark/>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
