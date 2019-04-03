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
  get value(): string | null {
    return this.$props.field.id;
  }

  set value(v: string | null) {
    this.$props.change(new Link(v, this.$props.field.type));
  }

  get linkOptions() {
    const compatibleTable = compatibleBlocks(this.$store, this.$props.serviceId);
    const compatible = compatibleTable[this.$props.field.type || ''] || [];
    return compatible;
  }

  get displayValue() {
    return this.value || 'click to assign';
  }

  startEdit() {
    fetchCompatibleBlocks(this.$store, this.$props.serviceId, this.$props.field.type);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable clickable" @click="startEdit">
      {{ displayValue | truncated }}
      <q-menu content-style="overflow: visible">
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
      </q-menu>
    </component>
  </div>
</template>
