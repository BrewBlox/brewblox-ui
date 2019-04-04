<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      required: true,
    },
    options: {
      type: Array,
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
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
})
export default class SelectPopupEdit extends Vue {
  placeholder: any = NaN;

  get selected(): any {
    if (Number.isNaN(this.placeholder)) {
      this.placeholder = this.$props.options.find(v => v.value === this.$props.field) || null;
    }
    return this.placeholder;
  }

  set selected(v: any) {
    this.placeholder = v;
  }

  get displayValue() {
    if (this.$props.multiple) {
      const text = this.$props.field
        .map((v: any) => this.$props.options.find((opt: any) => opt.value === v))
        .map((v: any) => v.label)
        .join(', ');
      return text || 'Click to set';
    }
    return (this.$props.options
      .find((opt: any) => opt.value === this.$props.field)
      || { label: 'Click to set' })
      .label;
  }

  endEdit() {
    this.$props.change(this.selected === null ? null : this.selected.value);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">
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
              v-model="selected"
              :options="$props.options"
              dark
              options-dark
              option-label="label"
            >
              <template v-slot:append v-if="clearable">
                <q-btn icon="mdi-close-circle" flat round size="sm" @click.stop="selected = null">
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
            <q-btn v-close-popup dark flat color="primary" label="Apply" @click="endEdit()"/>
          </q-item-section>
        </q-item>
      </q-menu>
    </component>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
