<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import sparkStore from '@/plugins/spark/store';

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
  placeholder: string | null = null;
  active: boolean = false;

  get value(): any {
    return this.active
      ? this.placeholder
      : NaN;
  }

  set value(v: any) {
    this.placeholder = v;
  }

  get linkOptions() {
    const compatibleTable = sparkStore.compatibleBlocks(this.$props.serviceId);
    const compatible = compatibleTable[this.$props.field.type || ''] || [];
    return compatible;
  }

  get displayValue() {
    return this.$props.field || 'click to assign';
  }

  startEdit() {
    sparkStore.fetchCompatibleBlocks([this.$props.serviceId, this.$props.field.type]);
    this.placeholder = this.$props.field.id;
    this.active = true;
  }

  save() {
    this.$props.change(new Link(this.placeholder, this.$props.field.type));
  }
}
</script>

<template>
  <div style="max-width: 100%">
    <component :is="$props.tag" class="editable clickable ellipsis">
      {{ displayValue | truncated }}
      <q-menu content-style="overflow: visible" @before-show="startEdit" @hide="active = false">
        <q-item dark>
          <q-item-section class="help-text text-weight-light">
            <big>{{ $props.label }}</big>
            <slot/>
          </q-item-section>
        </q-item>

        <q-item dark>
          <q-item-section>
            <q-select
              v-model="value"
              :options="linkOptions"
              :label="`${$props.label} block`"
              dark
              options-dark
            >
              <template v-slot:no-option>
                <q-item dark>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
              <template v-slot:append>
                <q-btn icon="mdi-close-circle" flat round size="sm" @click="value=null">
                  <q-tooltip>
                    <span>
                      Set {{ $props.label }} to
                      <i>None</i>
                    </span>
                  </q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section/>
          <q-item-section side>
            <q-btn v-close-popup dark flat color="primary" label="Cancel"/>
          </q-item-section>
          <q-item-section side>
            <q-btn v-close-popup dark flat color="primary" label="Apply" @click="save"/>
          </q-item-section>
        </q-item>
      </q-menu>
    </component>
  </div>
</template>
